import { A } from '@ember/array';
import EmberObject, { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { run } from '@ember/runloop';
import Controller from '@ember/controller';
import { isEmpty } from '@ember/utils';

import config from 'ember-get-config';
import { validator, buildValidations } from 'ember-cp-validations';
import $ from 'jquery';
import { task } from 'ember-concurrency';

import Analytics from 'ember-osf/mixins/analytics';
import permissions from 'ember-osf/const/permissions';
import NodeActionsMixin from 'ember-osf/mixins/node-actions';
import TaggableMixin from 'ember-osf/mixins/taggable-mixin';
import fixSpecialChar from 'ember-osf/utils/fix-special-char';
import extractDoiFromString from 'ember-osf/utils/extract-doi-from-string';

// Enum of available upload states > New project or existing project?
export const State = Object.freeze(EmberObject.create({
    START: 'start',
    NEW: 'new',
    EXISTING: 'existing',
}));

// Enum of available file states > New file or existing file?
export const existingState = Object.freeze(EmberObject.create({
    CHOOSE: 'choose',
    EXISTINGFILE: 'existing',
    NEWFILE: 'new',
}));

// Form data and validations
const BasicsValidations = buildValidations({
    basicsAbstract: {
        description: 'Abstract',
        validators: [
            validator('presence', true),
            validator('length', {
                // currently min of 20 characters --
                // this is what arXiv has as the minimum length of an abstract
                min: 20,
                max: 5000,
            }),
        ],
    },
    basicsDOI: {
        description: 'DOI',
        validators: [
            validator('format', {
                // Simplest regex- try not to diverge too much from the backend
                regex: /\b(10\.\d{4,}(?:\.\d+)*\/\S+(?:(?!["&'<>])\S))\b/,
                allowBlank: true,
                message: 'Please use a valid {description}',
            }),
        ],
    },
    basicsOriginalPublicationDate: {
        description: 'Original publication date',
        validators: [
            validator('date', {
                onOrBefore: 'now',
                precision: 'day',
            }),
        ],
    },
    basicsTitle: {
        description: 'Preprint title',
        validators: [
            validator('presence', true),
            validator('length', {
                // minimum length for title?
                max: 200,
            }),
        ],
    },
});

const PRE_MODERATION = 'pre-moderation';
const POST_MODERATION = 'post-moderation';

const MODAL_TITLE = {
    create: 'components.confirm-share-preprint.title.create',
    submit: 'components.confirm-share-preprint.title.submit',
    resubmit: 'components.confirm-share-preprint.title.resubmit',
};

const SUBMIT_MESSAGES = {
    default: 'submit.body.submit.information.line1.default',
    moderation: 'submit.body.submit.information.line1.moderation',
    [PRE_MODERATION]: 'submit.body.submit.information.line1.pre',
    [POST_MODERATION]: 'submit.body.submit.information.line1.post',
};

const PERMISSION_MESSAGES = {
    create: 'submit.body.submit.information.line2.create',
    submit: 'submit.body.submit.information.line2.submit',
};

const WORKFLOW = {
    [PRE_MODERATION]: 'global.pre_moderation',
    [POST_MODERATION]: 'global.post_moderation',
};

const ACTION = {
    create: {
        heading: 'submit.create_heading',
        button: 'submit.body.submit.create_button',
    },
    submit: {
        heading: 'submit.submit_heading',
        button: 'submit.body.submit.submit_button',
    },
};

function subjectIdMap(subjectArray) {
    // Maps array of arrays of disciplines into array of arrays of discipline ids.
    return subjectArray.map(subjectBlock => subjectBlock.map(subject => subject.id));
}

/**
 * @module ember-preprints
 * @submodule controllers
 */

/**
 * @class Submit Controller
 */
export default Controller.extend(Analytics, BasicsValidations, NodeActionsMixin, TaggableMixin, {
    i18n: service(),
    store: service(),
    theme: service(),
    fileManager: service(),
    raven: service(),
    toast: service(),
    panelActions: service(),

    editMode: false, // template is shared between edit and submit view

    _existingState: existingState,
    // Data for project picker; tracked internally on load

    user: null,
    // userNodesLoaded: false,

    _State: State,


    // file: null,
    // Preuploaded file - file that has been dragged to dropzone, but not uploaded to node.

    // selectedFile: null,
    // File that will be the preprint (already uploaded to node or selected from existing node)

    nodeLocked: false,
    // the node is locked.  Is True on Edit.

    searchResults: [],
    // List of users matching search query

    // savingPreprint: false,
    // True when Share button is pressed on Add Preprint page

    showModalSharePreprint: false,
    // True when sharing preprint confirmation modal is displayed

    // osfStorageProvider: null,
    // Preprint node's osfStorage object

    // osfProviderLoaded: false,
    // Preprint node's osfStorageProvider is loaded.

    // uploadInProgress: false,
    // Set to true when upload step is underway,

    shareButtonDisabled: false,

    attemptedSubmit: false,
    allProviders: [],
    // Initialize with an empty list of providers

    currentProvider: undefined,
    // IMPORTANT PROPERTY. After advancing beyond Step 1: Upload on Add Preprint form
    selectedProvider: undefined,

    selectedNode: null,

    preprintSaved: false,

    submitAction: null,

    // order that panels will open
    sectionOrder: ['Service', 'Upload', 'Basics', 'Authors', 'Discipline', 'SupplementalMaterials'],

    // if the user has clicked "continue" on that section
    providerSaved: false,
    uploadSaved: false,
    basicsSaved: false,
    authorsSaved: false,
    disciplinesSaved: false,

    // initial basics values
    basicsTitle: '',
    basicsAbstract: '',
    basicsDOI: '',
    basicsOriginalPublicationDate: '',
    basicsLicenseType: '',
    basicsLicenseYear: '',
    basicsLicenseCopyrightHolders: '',
    basicsTags: A(),

    moderationType: alias('currentProvider.reviewsWorkflow'),

    isTopLevelNode: computed.not('node.parent.id'),
    hasFile: computed.or('file', 'selectedFile'),
    isAddingPreprint: computed.not('editMode'),

    // Contributors on preprint
    contributors: A(),

    // userNodes: A(),

    availableLicenses: A(),
    subjectsList: A(),

    // In order to advance from upload state, node and selectedFile must have been defined
    uploadValid: alias('nodeLocked'), // Once the node has been locked (happens in step one of upload section), users are free to navigate through form unrestricted

    // Preprint can be published once all required sections have been saved.
    allSectionsValid: computed.and('uploadValid', 'basicsValid', 'authorsValid', 'disciplinesValid'),
    allSectionsSaved: computed.and('providerSaved', 'uploadSaved', 'basicsSaved', 'authorsSaved', 'disciplinesSaved'),

    // basics
    basicsValid: computed.and('licenseValid', 'abstractValid', 'doiValid', 'originalPublicationDateValid', 'preprintTitleValid'),
    abstractValid: alias('validations.attrs.basicsAbstract.isValid'),
    preprintTitleValid: alias('validations.attrs.basicsTitle.isValid'),
    doiValid: alias('validations.attrs.basicsDOI.isValid'),
    originalPublicationDateValid: alias('validations.attrs.basicsOriginalPublicationDate.isValid'),

    // Must have at least one contributor. Backend enforces admin and bibliographic rules.
    authorsValid: computed.bool('contributors.length'),

    // Must select at least one subject (looking at pending subjects)
    disciplinesValid: computed.notEmpty('subjectsList'),

    // Has the section been saved?
    // savedFile: computed.notEmpty('model.primaryFile.content'),

    // Are there any unsaved changes?
    basicsChanged: computed.or('tagsChanged', 'abstractChanged', 'doiChanged', 'licenseChanged', 'originalPublicationDateChanged'),
    uploadChanged: computed.or('preprintFileChanged', 'titleChanged'),
    licenseChanged: computed.or('basicsLicenseTypeChanged', 'basicsLicenseYearChanged', 'basicsLicenseCopyrightHoldersChanged'),

    // True if fields have been changed
    // hasDirtyFields: computed('theme.isProvider', 'hasFile', 'preprintSaved', 'isAddingPreprint', 'providerSaved', 'uploadChanged', 'basicsChanged', 'disciplineChanged', function() {
    //     const preprintStarted = this.get('theme.isProvider') ? this.get('hasFile') : this.get('providerSaved');
    //     const fieldsChanged = this.get('uploadChanged') || this.get('basicsChanged') || this.get('disciplineChanged');
    //     return !this.get('preprintSaved') && ((this.get('isAddingPreprint') && preprintStarted) || fieldsChanged);
    // }),

    // Are there validation errors which should be displayed right now?
    showValidationErrors: computed('attemptedSubmit', 'allSectionsValid', function() {
        return this.get('attemptedSubmit') && !this.get('allSectionsValid');
    }),

    // Does the pending primaryFile differ from the primary file already saved?
    // preprintFileChanged: computed('model.primaryFile', 'selectedFile', 'file', function() {
    //     return Object.keys(this.get('model').changedAttributes()).includes('primaryFile');
    //     // return (this.get('selectedFile.id') && (this.get('model.primaryFile.id') !== this.get('selectedFile.id'))) || this.get('file') !== null;
    // }),

    /*
        Service
    */
    providerChanged: computed('selectedProvider', 'currentProvider', function() {
        return this.get('selectedProvider.id') !== this.get('currentProvider.id');
    }),

    /*
        Basics
    */
    licenseValid: computed('model.license.requiredFields.[]', 'model.licenseRecord.{year,copyrightHolders}', function() {
        // Must have year and copyrightHolders if required by the licenseType selected
        const requiredFields = this.get('model.license.requiredFields');
        const yearRequired = requiredFields && requiredFields.includes('year');
        const copyrightHoldersRequired = requiredFields && requiredFields.includes('copyrightHolders');

        const yearValid = yearRequired && !this.get('model.licenseRecord.year');
        const copyrightHoldersValid = copyrightHoldersRequired && this.get('model.licenseRecord.copyrightHolders');

        return !(yearValid || copyrightHoldersValid) && this.get('model.license.content');
    }),

    titleChanged: computed('basicsTitle', function() {
        const basicsTitle = this.get('basicsTitle');
        const modelTitle = this.get('model.title');

        if (isEmpty(modelTitle) && isEmpty(basicsTitle)) {
            return false;
        }
        return modelTitle !== basicsTitle;
    }),

    abstractChanged: computed('basicsAbstract', function() {
        const basicsAbstract = this.get('basicsAbstract');
        const modelAbstract = this.get('model.description');

        if (isEmpty(modelAbstract) && isEmpty(basicsAbstract)) {
            return false;
        }
        return modelAbstract !== basicsAbstract;
    }),

    tagsChanged: computed('model.tags', function() {
        const basicsTags = this.get('basicsTags');
        const modelTags = this.get('model.tags');

        if (isEmpty(modelTags) && isEmpty(basicsTags)) {
            return false;
        }
        return basicsTags.some((v, i) => fixSpecialChar(v) !== fixSpecialChar(modelTags[i]));
    }),

    doiChanged: computed('basicsDOI', function() {
        const basicsDOI = this.get('basicsDOI');
        const modelDOI = this.get('model.doi');

        if (isEmpty(modelDOI) && isEmpty(basicsDOI)) {
            return false;
        }
        return modelDOI !== basicsDOI;
    }),

    basicsLicenseTypeChanged: computed('basicsLicenseType', function() {
        const basicsLicenseType = this.get('basicsLicenseType');

        if (isEmpty(this.get('model.license.content')) && isEmpty(basicsLicenseType)) {
            return false;
        }
        return this.get('model.license.id') !== basicsLicenseType.id;
    }),

    basicsLicenseYearChanged: computed('basicsLicenseYear', function() {
        const basicsLicenseYear = this.get('basicsLicenseYear');
        const modelLicenseYear = this.get('model.licenseRecord.year');

        if (isEmpty(modelLicenseYear) && isEmpty(basicsLicenseYear)) {
            return false;
        }
        return modelLicenseYear !== basicsLicenseYear;
    }),

    basicsLicenseCopyrightHoldersChanged: computed('basicsLicenseCopyrightHolders', function() {
        const basicsLicenseCopyrightHolders = this.get('basicsLicenseCopyrightHolders');
        const modelLicenseCopyrightHolders = this.get('model.licenseRecord.copyrightHolders');

        if (isEmpty(modelLicenseCopyrightHolders) && isEmpty(basicsLicenseCopyrightHolders)) {
            return false;
        }
        return modelLicenseCopyrightHolders.join(', ') !== basicsLicenseCopyrightHolders;
    }),


    originalPublicationDateChanged: computed('basicsOriginalPublicationDate', function () {
        const basicsOriginalPublicationDate = this.get('basicsOriginalPublicationDate');
        const modelOriginalPublicationDate = this.get('model.originalPublicationDate');

        if (isEmpty(modelOriginalPublicationDate) && isEmpty(basicsOriginalPublicationDate)) {
            return false;
        }
        return modelOriginalPublicationDate !== basicsOriginalPublicationDate;
    }),

    /*
        Disciplines
    */
    disciplineReduced: computed('model.subjects.@each.id', function() {
        // Flattened subject list
        return this.get('model.subjects').reduce((acc, val) => acc.concat(val), []).uniqBy('id');
    }),

    disciplineChanged: computed('model.subjects.@each.id', 'subjectsList.@each.id', function () {
        const currentSubjectIds = subjectIdMap(this.get('subjectsList'));
        const modelSubjectIds = subjectIdMap(this.get('model.subjects'));

        return JSON.stringify(modelSubjectIds) !== JSON.stringify(currentSubjectIds);
    }),

    /* Misc */

    // True if the current user has admin permissions
    // isAdmin: computed('model', function() {
    //     return (this.get('model.currentUserPermissions') || []).includes(permissions.ADMIN);
    // }),

    // // True if the current user is an admin
    // canEdit: computed('isAdmin', function() {
    //     return this.get('isAdmin');
    // }),

    workflow: computed('moderationType', function () {
        return WORKFLOW[this.get('moderationType')];
    }),

    providerName: computed('currentProvider', function() {
        return this.get('currentProvider.id') !== 'osf' ?
            this.get('currentProvider.name') :
            this.get('i18n').t('global.brand_name');
    }),

    modalTitle: computed('moderationType', function() {
        return this.get('moderationType') === PRE_MODERATION ?
            MODAL_TITLE.submit :
            MODAL_TITLE.create;
    }),

    // submission language
    heading: computed('moderationType', function() {
        return this.get('moderationType') === PRE_MODERATION ?
            ACTION.submit.heading :
            ACTION.create.heading;
    }),
    buttonLabel: computed('moderationType', function() {
        return this.get('moderationType') ?
            ACTION.submit.button :
            ACTION.create.button;
    }),
    generalInformation: computed('moderationType', function() {
        return this.get('moderationType') ?
            SUBMIT_MESSAGES.moderation :
            SUBMIT_MESSAGES.default;
    }),
    permissionInformation: computed('moderationType', function() {
        return this.get('moderationType') ?
            PERMISSION_MESSAGES.submit :
            PERMISSION_MESSAGES.create;
    }),
    moderationInformation: computed('moderationType', function() {
        return SUBMIT_MESSAGES[this.get('moderationType')];
    }),

    actions: {
        getContributors() {
            // TODO lauren: add current user as contributor
            // this.set('contributors', contributors));
        },

        // getParentContributors(parentNode) {
        //     // Returns all contributors of parentNode if component was created.
        //     // User later has option to import parentContributors to component.
        //     const parent = parentNode;
        //     const contributors = A();
        //     loadAll(parent, 'contributors', contributors).then(() =>
        //         this.set('parentContributors', contributors));
        // },

        next(currentPanelName) {
            // Open next panel
            if (currentPanelName === 'Upload' || currentPanelName === 'Basics') {
                run.scheduleOnce('afterRender', this, function() {
                    MathJax.Hub.Queue(['Typeset', MathJax.Hub, $(currentPanelName === 'Upload' ? '.preprint-header-preview' : '.abstract')[0]]);
                });
            }
            if (currentPanelName === 'Authors') {
                this.get('metrics').trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Submit - Authors Next Button',
                });
            }
            this.get('panelActions').close(this.get(`sectionOrder.${this.get('sectionOrder').indexOf(currentPanelName)}`));
            this.get('panelActions').open(this.get(`sectionOrder.${this.get('sectionOrder').indexOf(currentPanelName) + 1}`));
        },

        // nextUploadSection(currentUploadPanel, nextUploadPanel) {
        //     // Opens next panel within the Upload Section, Existing Workflow
        //     // (Choose Project - Choose File - Organize - Finalize Upload)
        //     this.get('panelActions').toggle(currentUploadPanel);
        //     this.get('panelActions').toggle(nextUploadPanel);
        // },

        // changesSaved(currentPanelName) {
        //     // Temporarily changes panel save state to true.
        //     // Used for flashing 'Changes Saved' in UI.
        //     const currentPanelSaveState = `${currentPanelName.toLowerCase()}SaveState`;
        //     this.set(currentPanelSaveState, true);
        //     run.later(this, () => {
        //         this.set(currentPanelSaveState, false);
        //     }, 3000);
        // },

        error(error /* , transition */) {
            this.get('toast').error(error);
        },

        /*
          Upload section
        */
        changeInitialState(newState) {
            // Sets filePickerState to start, new, or existing -
            // this is the initial decision on the form.
            this.set('filePickerState', newState);
            this.send('clearDownstreamFields', 'allUpload');
            if (newState === this.get('_State').NEW) {
                this.get('metrics').trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Submit - Upload new preprint',
                });
            } else if (newState === this.get('_State').EXISTING) {
                this.get('panelActions').open('chooseProject');
                this.get('panelActions').close('selectExistingFile');
                this.get('panelActions').close('uploadNewFile');
                this.get('panelActions').close('organize');
                this.get('panelActions').close('finalizeUpload');
                this.get('metrics').trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Submit - Connect preprint to existing OSF Project',
                });
            } else {
                this.get('metrics').trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Submit - Back Button, Upload Section',
                });
            }
        },

        finishUpload() {
            // Locks node so that preprint location cannot be modified.
            // Occurs after upload step is complete.
            // In editMode, nodeLocked is set to true.
            // Locks node and advances to next form section.
            this.setProperties({
                nodeLocked: true,
                file: null,
            });
            // Closes section, so all panels closed if Upload section revisited
            this.get('panelActions').close('uploadNewFile');
            this.send('next', this.get('Upload'));
        },

        // existingNodeExistingFile() {
        //     // Upload case for using existing node and existing file for the preprint.
        //     // If title has been edited, updates title.
        //     this.get('metrics')
        //         .trackEvent({
        //             category: 'button',
        //             action: 'click',
        //             label: 'Submit - Save and Continue, Existing Node Existing File',
        //         });

        //     const model = this.get('model');
        //     const node = this.get('node');
        //     const currentNodeTitle = node.get('title');
        //     const title = this.get('title');

        //     this.set('basicsAbstract', this.get('model.description') || null);

        //     if (currentNodeTitle !== title) {
        //         model.set('title', title);
        //         node.set('title', title);
        //         node.save();
        //     }

        //     return Promise.resolve()
        //         .then(this._setNodeTitle.bind(this))
        //         .then(this._sendToPreprintStartOrAbandon.bind(this))
        //         .catch(this._failSetNodeTitle.bind(this));
        // },
        // createComponentCopyFile() {
        //     // Upload case for using a new component and an existing file for the preprint.
        //     // Creates a component and then copies file from parent node to new component.
        //     const node = this.get('node');
        //     this.get('metrics').trackEvent({
        //         category: 'button',
        //         action: 'click',
        //         label: 'Submit - Save and Continue, New Component, Copy File',
        //     });

        //     node.addChild(this.get('title'))
        //         .then(this._addChild.bind(this))
        //         .catch(this._failCreateComponent.bind(this));
        // },

        // startPreprint() {
        //     // Initiates preprint.  Occurs in Upload section of Add Preprint form
        //     // when pressing 'Save and continue'.  Creates a preprint with
        //     // primaryFile, node, and provider fields populated.
        //     const model = this.get('model');

        //     model.set('primaryFile', this.get('selectedFile'));
        //     // model.set('node', this.get('node'));
        //     model.set('provider', this.get('currentProvider'));

        //     // return model.save()
        //     //     .then(this._finishUpload.bind(this))
        //     //     .catch(this._failedUpload.bind(this));
        // },

        // Takes file chosen from file-browser and sets equal to selectedFile.
        // This file will become the preprint.
        selectExistingFile(file) {
            this.set('selectedFile', file);
        },

        // Discards upload section changes.  Restores displayed file to current preprint primaryFile
        // and resets displayed title to current node title. (No requests sent, front-end only.)
        discardUploadChanges() {
            this.get('metrics').trackEvent({
                category: 'button',
                action: 'click',
                label: 'Submit - Discard Upload Changes',
            });

            this.setProperties({
                file: null,
                selectedFile: this.get('store').peekRecord('file', this.get('model.primaryFile.id')),
            });
        },

        // If user goes back and changes a section inside Upload,
        // all fields downstream of that section need to clear.
        clearDownstreamFields(section) {
            // Only clear downstream fields in Add mode!
            if (this.get('nodeLocked')) { return; }

            const props = [];

            /* eslint-disable no-fallthrough */
            switch (section) {
            case 'allUpload':
                props.push('node');
            case 'belowNode':
                props.push('selectedFile', 'file');
            case 'belowFile':
                props.push('convertOrCopy');
            case 'belowConvertOrCopy':
                props.push('title');
                break;
            default:
            }
            /* eslint-enable no-fallthrough */

            const mergeObj = {};

            for (const prop of props) { mergeObj[prop] = null; }

            this.setProperties(mergeObj);
        },
        /*
          Basics section
         */
        preventDefault(e) {
            e.preventDefault();
        },

        // stripDOI() {
        //     // Replaces the inputted doi link with just the doi itself
        //     this.get('metrics').trackEvent({
        //         category: 'input',
        //         action: 'onchange',
        //         label: 'Submit - DOI Text Change',
        //     });

        //     const basicsDOI = this.get('basicsDOI');
        //     this.set('basicsDOI', extractDoiFromString(basicsDOI));
        // },

        saveBasics() {
            this.get('metrics').trackEvent({
                category: 'button',
                action: 'click',
                label: 'Submit - Save and Continue Basics Section',
            });

            const model = this.get('model');

            if (this.get('titleChanged')) {
                model.set('title', this.get('basicsTitle'));
            }

            if (this.get('abstractChanged')) {
                model.set('description', this.get('basicsAbstract'));
            }

            if (this.get('tagsChanged')) {
                model.set('tags', this.get('basicsTags'));
            }

            if (this.get('doiChanged')) {
                model.set('doi', this.get('basicsDOI') || null);
            }

            if (this.get('originalPublicationDateChanged')) {
                model.set('originalPublicationDate', this.get('basicsOriginalPublicationDate') || null);
            }

            if (this.get('licenseChanged')) {
                const copyrightHolders = this.get('basicsLicenseCopyrightHolders')
                    .split(', ')
                    .map(item => item.trim());

                model.setProperties({
                    licenseRecord: {
                        year: this.get('basicsLicenseYear'),
                        copyright_holders: copyrightHolders,
                    },
                    license: this.get('basicsLicenseType'),
                });
                this.get('metrics').trackEvent({
                    category: 'dropdown',
                    action: 'select',
                    label: 'Submit - Edit License',
                });
            }

            this.set('basicsSaved', true);
            this.send('next', 'Basics');
        },

        addTag(tag) {
            this.get('metrics').trackEvent({
                category: 'input',
                action: 'onchange',
                label: 'Submit - Add Tag',
            });

            this.get('basicsTags').pushObject(tag);
        },

        removeTag(tagIndex) {
            this.get('metrics').trackEvent({
                category: 'button',
                action: 'click',
                label: 'Submit - Remove Tag',
            });
            this.get('basicsTags').removeAt(tagIndex);
        },

        /*
          Discipline section
        */
        discardSubjects() {
            this.get('metrics').trackEvent({
                category: 'button',
                action: 'click',
                label: 'Submit - Discard Discipline Changes',
            });

            this.set('subjectsList', $.extend(true, [], this.get('model.subjects')));
        },

        saveSubjects() {
            this.get('metrics').trackEvent({
                category: 'button',
                action: 'click',
                label: 'Submit - Discipline Save and Continue',
            });

            if (this.get('disciplineChanged')) {
                this.get('model').set('subjects', this.get('subjectsList'));
            }

            this.set('disciplinesSaved', true);
            this.send('next', 'Discipline');
        },

        /**
         * findContributors method.  Queries APIv2 users endpoint on any of a set of name fields.
         * Fetches specified page of results.
         *
         * @method findContributors
         * @param {String} query ID of user that will be a contributor on the node
         * @param {Integer} page Page number of results requested
         * @return {User[]} Returns specified page of user records matching query
         */
        findContributors(query, page) {
            this.get('metrics').trackEvent({
                category: 'button',
                action: 'click',
                label: 'Submit - Search for Authors',
            });

            return this.store.query('user', {
                filter: {
                    'full_name,given_name,middle_name,family_name': query,
                },
                page,
            })
                .then(this._setContributorSearchResults.bind(this))
                .catch(this._setContributorSearchResultsError.bind(this));
        },

        /**
        * highlightSuccessOrFailure method.
        * Element with specified ID flashes green or red depending on response success.
        *
        * @method highlightSuccessOrFailure
        * @param {string} elementId Element ID to change color
        * @param {Object} context "this" scope
        * @param {string} status "success" or "error"
        */
        // highlightSuccessOrFailure(elementId, context, status) {
        //     const highlightClass = `${status === 'success' ? 'success' : 'error'}Highlight`;

        //     context.$(`#${elementId}`).addClass(highlightClass);

        //     run.later(() => context.$(`#${elementId}`).removeClass(highlightClass), 2000);
        // },

        /*
          Submit tab actions
         */
        clickSubmit() {
            if (this.get('allSectionsValid')) {
                // Toggles display of share preprint modal
                this.get('metrics').trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Submit - Open Share Preprint Modal',
                });
                this.toggleProperty('showModalSharePreprint');
            } else {
                this.get('metrics').trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Submit - Display validation errors',
                });
                this.set('attemptedSubmit', true);
            }
        },
        savePreprint() {
            // Finalizes saving of preprint.  Publishes preprint and turns node public.
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Submit - Share Preprint',
                });

            // reassign the subjects to just the ids before saving
            // this.get('model').set('subjects', subjectIdMap(this.get('subjectsList')));

            const model = this.get('model');
            const node = this.get('node');
            this.set('savingPreprint', true);
            this.toggleProperty('shareButtonDisabled');
            model.set('provider', this.get('currentProvider'));

            const isModerated = this.get('moderationType');
            if (!isModerated) {
                model.set('isPublished', true);
            }
            node.set('public', true);
            this.set('model', model);
            this.set('node', node);

            return model.save()
                .then(() => node.save())
                // .then(this._resaveModel.bind(this))
                .catch(this._failSaveModel.bind(this));
        },
        cancel() {
            this.transitionToRoute('index');
        },

        selectProvider(provider) {
            this.set('selectedProvider', provider);
        },

        discardProvider() {
            this.set('selectedProvider', this.get('currentProvider'));
        },
    },

    discardBasics: task(function* () {
        this.get('metrics').trackEvent({
            category: 'button',
            action: 'click',
            label: 'Submit - Discard Basics Changes',
        });

        this.set('basicsTitle', this.get('model.title'));
        this.set('basicsAbstract', this.get('model.description'));
        this.set('basicsDOI', this.get('model.doi'));
        this.set('basicsOriginalPublicationDate', this.get('model.originalPublicationDate'));
        this.set(
            'basicsTags',
            this.get('model.tags') ? this.get('model.tags').slice(0).map(fixSpecialChar) : A(),
        );

        yield this.get('discardLicense').perform();
    }),

    discardLicense: task(function* () {
        const modelLicense = yield this.get('model.license');

        this.set('basicsLicenseType', modelLicense || '');

        this.set(
            'basicsLicenseYear',
            this.get('model.licenseRecord') ? this.get('model.licenseRecord').year : '',
        );
        this.set(
            'basicsLicenseCopyrightHolders',
            this.get('model.licenseRecord') ? this.get('model.licenseRecord').copyright_holders.join(', ') : '',
        );
    }),

    saveProvider: task(function* () {
        this.get('metrics').trackEvent({
            category: 'button',
            action: 'click',
            label: `Submit - Save and continue, Select ${this.get('currentProvider.name')} preprint service`,
        });

        this.set('currentProvider', this.get('selectedProvider'));

        const licenses = yield this.get('currentProvider').queryHasMany('licensesAcceptable', { 'page[size]': 20 });
        this.set('availableLicenses', licenses);

        this.set('providerSaved', true);
        this.send('discardSubjects');

        this.get('discardLicense').perform();

        this.send('next', 'Service');
    }),

    setCurrentProvider: task(function* () {
        const providers = yield this.get('store').findAll('preprint-provider', { reload: true });

        this.set(
            'allProviders',
            // OSF first, then all the rest
            providers.filter(item => item.id === 'osf').concat(providers.filter(item => item.id !== 'osf')),
        );

        const currentProvider = providers.filter(item => item.id === this.get('theme.id') || config.PREPRINTS.provider)[0];

        this.set('currentProvider', currentProvider);
        this.set('selectedProvider', currentProvider);
        if (this.get('theme.isProvider')) {
            this.set('providerSaved', true);
        }
    }),

    // _resaveModel() {
    //     const model = this.get('model');
    //     const preprintId = model.get('id');
    //     // Fix for IN-271: Terrible kluge to reattach periodically lost primary files
    //     // that is likely due to a backend race condition in celery tasks.
    //     // The OSF api does not return null for empty to one relationships
    //     // which causes ember to not nullify the primaryFile relationship when it gets
    //     // disconnected. So the model needs to be unloaded, reloaded, reassigned, and
    //     // saved. This resaving of the preprint should be removed
    //     // (likely after node-preprint divorce)
    //     model.unloadRecord();
    //     return this.get('store').findRecord('preprint', preprintId).then(this._setPrimaryFile.bind(this));
    // },

    // _setPrimaryFile(preprint) {
    //     if (!this.get('editMode')) {
    //         preprint.set('primaryFile', this.get('selectedFile'));
    //         this.set('model', preprint);
    //     }
    //     return preprint.save().then(this._savePreprint.bind(this));
    // },

    _savePreprint() {
        const isModerated = this.get('moderationType');
        const preprint = this.get('model');

        this.set('preprintSaved', true);
        if (isModerated) {
            const submitAction = this.get('store').createRecord('review-action', {
                actionTrigger: 'submit',
                target: preprint,
            });
            submitAction.save();
        }
        let useProviderRoute = false;
        if (this.get('theme.isProvider')) {
            useProviderRoute = this.get('theme.isSubRoute');
        } else if (this.get('currentProvider.domain') && this.get('currentProvider.domainRedirectEnabled')) {
            window.location.replace(`${this.get('currentProvider.domain')}${preprint.id}`);
        } else if (this.get('currentProvider.id') !== 'osf') {
            useProviderRoute = true;
        }
        this.transitionToRoute(`${useProviderRoute ? 'provider.' : ''}content`, preprint);
    },

    // _failSaveModel() {
    //     this.toggleProperty('shareButtonDisabled');
    //     return this.get('toast')
    //         .error(this.get('i18n')
    //             .t(`submit.error_${this.get('editMode') ? 'completing' : 'saving'}_preprint`));
    // },

    // _setNodePreprints(preprints) {
    //     this.set('existingPreprints', preprints);
    //     if (preprints.toArray().length > 0) { // If node already has a preprint
    //         const preprint = preprints.toArray()[0]; // TODO change after branded finished
    //         if (!(preprint.get('isPublished'))) { // Preprint exists in abandoned state.
    //             this.set('abandonedPreprint', preprint);
    //         }
    //     }
    // },

    // _sendToPreprintStartOrAbandon() {
    //     this.send(this.get('abandonedPreprint') ? 'resumeAbandonedPreprint' : 'startPreprint');
    // },

    // _setNodeTitle() {
    //     const node = this.get('node');
    //     const model = this.get('model');

    //     const currentNodeTitle = node.get('title');
    //     const title = this.get('title');

    //     if (currentNodeTitle === title) {
    //         return;
    //     }
    //     model.set('title', title);
    //     node.set('title', title);
    //     return node.save();
    // },

    // _failSetNodeTitle(error) {
    //     const node = this.get('node');
    //     const currentNodeTitle = node.get('title');

    //     node.set('title', currentNodeTitle);
    //     this.get('toast').error(this.get('i18n').t('submit.could_not_update_title'));
    //     this.get('raven').captureMessage('Could not update title', { extra: { error } });
    // },

    // _addChild(child) {
    //     const node = this.get('node');

    //     this.set('parentNode', node);
    //     this.send('getParentContributors', node);
    //     this.set('node', child);
    //     this.set('basicsAbstract', this.get('node.description') || null);
    //     child.get('files')
    //         .then(this._getFiles.bind(this))
    //         .catch(this._failGetFiles.bind(this));
    // },

    // _getFiles(fileProviders) {
    //     const child = this.get('node');
    //     const osfstorage = fileProviders.findBy('name', 'osfstorage');

    //     this.get('fileManager').copy(this.get('selectedFile'), osfstorage, { data: { resource: child.id } })
    //         .then(this._copyFile.bind(this))
    //         .catch(this._failCopyFile.bind(this));
    // },

    // _copyFile(copiedFile) {
    //     this.set('selectedFile', copiedFile);
    //     this.send('startPreprint', this.get('parentNode'));
    // },

    // _failCopyFile(error) {
    //     this.get('toast').error(this.get('i18n').t('submit.error_copying_file'));
    //     this.get('raven').captureMessage('Could not copy file', { extra: { error } });
    // },

    // _failGetFiles(error) {
    //     this.get('toast').error(this.get('i18n').t('submit.error_accessing_parent_files'));
    //     this.get('raven').captureMessage('Could not access parent files', { extra: { error } });
    // },

    // _failCreateComponent(error) {
    //     this.get('toast').error(this.get('i18n').t('submit.could_not_create_component'));
    //     this.get('raven').captureMessage('Could not create component', { extra: { error } });
    // },

    // _failDeletePreprint(error) {
    //     this.get('toast').error(this.get('i18n').t(
    //         'submit.abandoned_preprint_error',
    //         {
    //             documentType: this.get('currentProvider.documentType'),
    //         },
    //     ));
    //     this.get('raven').captureMessage('Could not retrieve abandoned preprint', { extra: { error } });
    // },

    // _sendStartPreprint() {
    //     this.send('startPreprint');
    // },

    // _finishUpload() {
    //     // Sets upload form state to existing project (now that project has been created)
    //     this.set('filePickerState', State.EXISTING);
    //     // Sets file state to new file, for edit mode.
    //     this.set('existingState', existingState.NEWFILE);
    //     this.set('file', null);
    //     this.get('toast').info(this.get('i18n').t('submit.preprint_file_uploaded', {
    //         documentType: this.get('currentProvider.documentType'),
    //     }));
    //     this.send('finishUpload');
    // },

    // _failedUpload(error) {
    //     const parentNode = this.get('parentNode');

    //     // Allows user to attempt operation again.
    //     this.set('uploadInProgress', false);
    //     if (parentNode) {
    //         // If creating preprint failed after a component was created,
    //         // set the node back to the parentNode.
    //         // If user tries to initiate preprint again,
    //         // a separate component will be created under the parentNode.
    //         this.set('node', parentNode);
    //     }
    //     this.get('toast').error(this.get('i18n').t(
    //         'submit.error_initiating_preprint',
    //         {
    //             documentType: this.get('currentProvider.documentType'),
    //         },
    //     ));
    //     this.get('raven').captureMessage('Could not initiate preprint', { extra: { error } });
    // },

    _setContributorSearchResults(contributors) {
        this.set('searchResults', contributors);
        return contributors;
    },

    _setContributorSearchResultsError() {
        this.get('toast').error(this.get('i18n').t('submit.search_contributors_error'));
        this.highlightSuccessOrFailure('author-search-box', this, 'error');
    },

    // _saveModel() {
    //     const model = this.get('model');

    //     model.save();
    // },

    // _submitAction() {
    //     const submitAction = this.get('submitAction');

    //     submitAction.save();
    // },

    // _saveChanges() {
    //     const model = this.get('model');

    //     this.set('preprintSaved', true);
    //     let useProviderRoute = false;

    //     if (this.get('theme.isProvider')) {
    //         useProviderRoute = this.get('theme.isSubRoute');
    //     } else if (this.get('currentProvider.domain') && this.get('currentProvider.domainRedirectEnabled')) {
    //         window.location.replace(`${this.get('currentProvider.domain')}${model.id}`);
    //     } else if (this.get('currentProvider.id') !== 'osf') {
    //         useProviderRoute = true;
    //     }
    //     this.transitionToRoute(
    //         `${useProviderRoute ? 'provider.' : ''}content`,
    //         model.reload(),
    //     );
    // },

    // _saveChangesError() {
    //     this.toggleProperty('shareButtonDisabled');
    //     return this.get('toast')
    //         .error(this.get('i18n')
    //             .t(`submit.error_${this.get('editMode') ? 'completing' : 'saving'}_preprint`));
    // },

    _transitionToPreprint() {
        this.set('preprintSaved', true);
        this.get('model').reload();
        this.transitionToRoute(
            `${this.get('theme.isSubRoute') ? 'provider.' : ''}content`,
            this.get('model'),
        );
    },

    _transitionToPreprintError() {
        this.toggleProperty('shareButtonDisabled');
        return this.get('toast')
            .error(this.get('i18n')
                .t(`submit.error_${this.get('editMode') ? 'completing' : 'saving'}_preprint`));
    },

    clearFields() {
        // Restores submit form defaults.
        // Called when user submits preprint, then hits back button, for example.
        this.get('panelActions').open('Upload');

        this.setProperties({
            filePickerState: State.START,
            existingState: existingState.CHOOSE,
            user: null,
            userNodes: A(),
            userNodesLoaded: false,
            node: null,
            file: null,
            selectedFile: null,
            contributors: A(),
            title: '',
            nodeLocked: false, // Will be set to true if edit?
            searchResults: [],
            savingPreprint: false,
            showModalSharePreprint: false,

            parentNode: null,
            parentContributors: A(),
            convertProjectConfirmed: false,
            convertOrCopy: null,
            osfStorageProvider: null,

            uploadInProgress: false,
            existingPreprints: A(),
            shareButtonDisabled: false,
            // Basics and subjects fields need to be reset because
            // the Add process overwrites the computed properties as reg properties
            basicsTags: A(),
            basicsAbstract: null,
            basicsDOI: null,
            basicsOriginalPublicationDate: null,

            subjectsList: A(),
            availableLicenses: A(),
            attemptedSubmit: false,
        });
    },

    // Selected upload state (initial decision on form) - new or existing project?
    filePickerState: State.START,
    existingState: existingState.CHOOSE,
});
