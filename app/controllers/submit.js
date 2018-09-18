import { A } from '@ember/array';
import EmberObject, { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { merge } from '@ember/polyfills';
import { run } from '@ember/runloop';
import Controller from '@ember/controller';
import { isEmpty } from '@ember/utils';

import config from 'ember-get-config';
import { validator, buildValidations } from 'ember-cp-validations';
import $ from 'jquery';

import Analytics from 'ember-osf/mixins/analytics';
import permissions from 'ember-osf/const/permissions';
import NodeActionsMixin from 'ember-osf/mixins/node-actions';
import TaggableMixin from 'ember-osf/mixins/taggable-mixin';
import loadAll from 'ember-osf/utils/load-relationship';
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

});

const PENDING = 'pending';
const ACCEPTED = 'accepted';
const REJECTED = 'rejected';

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

const EDIT_MESSAGES = {
    line1: {
        [PRE_MODERATION]: 'submit.body.edit.information.line1.pre',
        [POST_MODERATION]: 'submit.body.edit.information.line1.post_rejected',
    },
    line2: {
        [PENDING]: {
            [PRE_MODERATION]: 'submit.body.edit.information.line2.pre_pending',
        },
        [REJECTED]: {
            [PRE_MODERATION]: 'submit.body.edit.information.line2.pre_rejected',
            [POST_MODERATION]: 'submit.body.edit.information.line2.post_rejected',
        },
    },
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
    toast: service('toast'),
    panelActions: service('panelActions'),

    _existingState: existingState,
    // Data for project picker; tracked internally on load
    user: null,
    userNodesLoaded: false,

    _State: State,
    // Information about the thing to be turned into a preprint
    node: null,
    // Project or component that preprint file was copied from
    file: null,
    // Preuploaded file - file that has been dragged to dropzone, but not uploaded to node.
    uploadedFileId: null,
    // uploadedFileId saved off in case file upload succeeds but preprint request fails
    uploadedFileName: false,
    selectedFile: null,
    // File that will be the preprint
    selectedSupplementalProject: null,
    // Pending supplemental project that will be set as the supplemental project on the node
    title: '',
    // Preprint title
    supplementalProjectTitle: '',
    // Supplemental Project Title
    pendingSupplementalProjectTitle: '',
    preprintLocked: false,
    // the preprint is locked.  Is True on Edit.
    searchResults: [],
    // List of users matching search query
    savingPreprint: false,
    // True when Share button is pressed on Add Preprint page
    showModalSharePreprint: false,
    // True when sharing preprint confirmation modal is displayed
    serverSaveState: false,
    // True temporarily when changes have been saved in server section
    uploadSaveState: false,
    // True temporarily when changes have been saved in upload section
    disciplineSaveState: false,
    // True temporarily when changes have been saved in discipline section
    basicsSaveState: false,
    // True temporarily when changes have been saved in basics section
    authorsSaveState: false,
    // True temporarily when changes have been saved in authors section
    suppplementalSaveState: false,
    // True temporarily when changes have been saved in the supplemental section
    osfStorageProvider: null,
    // Preprint node's osfStorage object
    osfProviderLoaded: false,
    // Preprint node's osfStorageProvider is loaded.
    titleValid: null,
    // If preprint's pending title is valid.
    supplementalProjectTitleValid: null,
    // If updated supplemental project title is valid.
    supplementalProjectTitleUpdatedValid: null,
    // If supplemental project's pending title is valid
    uploadInProgress: false,
    // Set to true when upload step is underway,
    editMode: false,
    // Edit mode is false by default.
    shareButtonDisabled: false,
    attemptedSubmit: false,
    allProviders: [],
    // Initialize with an empty list of providers
    currentProvider: undefined,
    // IMPORTANT PROPERTY. After advancing beyond Step 1: Upload on Add Preprint form
    selectedProvider: undefined,
    providerSaved: false,
    preprintSaved: false,

    submitAction: null,

    // Validation rules and changed states for form sections

    providerChanged: true,

    // Must have year and copyrightHolders filled if those are required by the licenseType selected
    licenseValid: false,

    hasFile: computed.or('file', 'selectedFile'),
    isAddingPreprint: computed.not('editMode'),
    existingPreprints: A(), // Existing preprints on the current node
    // Contributors on preprint - if creating a component,
    // contributors will be copied over from parent
    contributors: A(),
    projectContributors: A(),
    userNodes: A(),
    availableLicenses: A(),
    _names: ['server', 'upload', 'discipline', 'basics', 'authors', 'supplemental'].map(str => str.capitalize()), // Form section headers

    // In order to advance from upload state, node and selectedFile must
    // have been defined, and title must be set.
    uploadValid: alias('preprintLocked'), // Once the node has been locked (happens in step one of upload section), users are free to navigate through form unrestricted
    abstractValid: alias('validations.attrs.basicsAbstract.isValid'),

    doiValid: alias('validations.attrs.basicsDOI.isValid'),
    originalPublicationDateValid: alias('validations.attrs.basicsOriginalPublicationDate.isValid'),

    // Basics fields that are being validated are abstract, license and doi
    // (title validated in upload section). If validation
    // added for other fields, expand basicsValid definition.
    basicsValid: computed.and('abstractValid', 'doiValid', 'licenseValid', 'originalPublicationDateValid'),

    // Must have at least one contributor. Backend enforces admin and bibliographic rules.
    // If this form section is ever invalid, something has gone horribly wrong.
    authorsValid: computed.bool('contributors.length'),

    // Must select at least one subject (looking at pending subjects)
    disciplineValid: computed.notEmpty('subjectsList'),

    // Does node have a saved title?
    savedTitle: computed.notEmpty('model.title'),

    // Does preprint have a saved primaryFile?
    savedFile: computed.notEmpty('model.primaryFile.content'),

    // Does node have a saved description?
    savedAbstract: computed.notEmpty('model.description'),

    // Does preprint have saved subjects?
    savedSubjects: computed.notEmpty('model.subjects'),

    // Preprint can be published once all required sections have been saved.
    allSectionsValid: computed.and('savedTitle', 'savedFile', 'savedAbstract', 'savedSubjects', 'authorsValid'),

    // Are there any unsaved changes in the upload section?
    uploadChanged: computed.or('preprintFileChanged', 'titleChanged'),

    basicsDOI: computed.or('model.doi'),

    // This is done to initialize basicsOriginalPublicationDate to the date fetched
    // from an existing preprint, similar to how basicsDOI is initialized.
    basicsOriginalPublicationDate: computed.or('model.originalPublicationDate'),

    // Are there any unsaved changes in the basics section?
    basicsChanged: computed.or('tagsChanged', 'abstractChanged', 'doiChanged', 'licenseChanged', 'originalPublicationDateChanged'),

    moderationType: alias('currentProvider.reviewsWorkflow'),

    supplementalChanged: computed('supplementalProjectTitle', 'pendingSupplementalProjectTitle', 'selectedSupplementalProject', function() {
        if (this.get('selectedSupplementalProject')) {
            return this.get('selectedSupplementalProject.id') !== this.get('node.id');
        } else {
            return this.get('supplementalProjectTitle') !== this.get('pendingSupplementalProjectTitle');
        }
    }),

    // True if fields have been changed
    hasDirtyFields: computed('theme.isProvider', 'hasFile', 'preprintSaved', 'isAddingPreprint', 'providerSaved', 'uploadChanged', 'basicsChanged', 'disciplineChanged', function() {
        const preprintStarted = this.get('theme.isProvider') ? this.get('hasFile') : this.get('providerSaved');
        const fieldsChanged = this.get('uploadChanged') || this.get('basicsChanged') || this.get('disciplineChanged');
        return !this.get('preprintSaved') && ((this.get('isAddingPreprint') && preprintStarted) || fieldsChanged);
    }),

    // Relevant in Add mode - flag prevents users from sending multiple requests to server
    currentPanelName: computed('editMode', 'theme.isProvider', function() {
        return this.get('isAddingPreprint') ? this.get('_names')[0] : null;
    }),

    // Are there validation errors which should be displayed right now?
    showValidationErrors: computed('attemptedSubmit', 'allSectionsValid', function() {
        return this.get('attemptedSubmit') && !this.get('allSectionsValid');
    }),

    // Does the pending primaryFile differ from the primary file already saved?
    preprintFileChanged: computed('model.primaryFile', 'selectedFile', 'file', function() {
        return (this.get('selectedFile.id') && (this.get('model.primaryFile.id') !== this.get('selectedFile.id'))) || this.get('file') !== null;
    }),

    // Does the pending preprint title differ from the title already saved?
    titleChanged: computed('model.title', 'title', function() {
        const title = this.get('title');
        const modelTitle = this.get('model.title');
        if (isEmpty(title) && isEmpty(modelTitle)) {
            return false;
        }
        return modelTitle !== title;
    }),

    // Pending abstract
    basicsAbstract: computed('model.description', function() {
        return this.get('model.description') || null;
    }),

    // Does the pending abstract differ from the saved abstract in the db?
    abstractChanged: computed('basicsAbstract', 'model.description', function() {
        const basicsAbstract = this.get('basicsAbstract');
        return basicsAbstract !== null && basicsAbstract.trim() !== this.get('model.description');
    }),

    // Pending tags
    basicsTags: computed('model.tags', function() {
        const tags = this.get('model.tags');
        return (tags && tags.map(fixSpecialChar)) || A();
    }),

    // Does the list of pending tags differ from the saved tags in the db?
    tagsChanged: computed('basicsTags.@each', 'model.tags', function() {
        const basicsTags = this.get('basicsTags');
        const tags = this.get('model.tags');

        return basicsTags && tags &&
            (
                basicsTags.length !== tags.length ||
                basicsTags.some((v, i) => fixSpecialChar(v) !== fixSpecialChar(tags[i]))
            );
    }),

    doiChanged: computed('model.doi', 'basicsDOI', function() {
        // Does the pending DOI differ from the saved DOI in the db?
        // If pending DOI and saved DOI are both falsy values, doi has not changed.
        const basicsDOI = extractDoiFromString(this.get('basicsDOI'));
        const modelDOI = this.get('model.doi');
        return (basicsDOI || modelDOI) && basicsDOI !== modelDOI;
    }),

    // license object with null values
    basicsLicense: computed('model', function() {
        const record = this.get('model.licenseRecord');
        const license = this.get('model.license');
        return {
            year: record ? record.year : null,
            copyrightHolders: record && record.copyright_holders ? record.copyright_holders.join(', ') : '',
            licenseType: license || null,
        };
    }),

    // This loads up the current license information if the preprint has one
    licenseChanged: computed('model.{license,licenseRecord}', 'basicsLicense.{year,copyrightHolders,licenseType}', function() {
        if (this.get('model.licenseRecord') || this.get('model.license.content')) {
            if (this.get('model.license.name') !== this.get('basicsLicense.licenseType.name')) return true;
            if (this.get('model.licenseRecord').year !== this.get('basicsLicense.year')) return true;
            if ((this.get('model.licenseRecord.copyright_holders.length') ?
                this.get('model.licenseRecord.copyright_holders').join(', ') :
                '') !== this.get('basicsLicense.copyrightHolders')) return true;
        } else {
            if (this.get('basicsLicense.licenseType.name') && (this.get('availableLicenses').toArray().length ?
                this.get('availableLicenses').toArray()[0].get('name') :
                null) !== this.get('basicsLicense.licenseType.name')) return true;
            if (this.get('basicsLicense.year') && (new Date()).getUTCFullYear().toString() !== this.get('basicsLicense.year')) return true;
            if (!(this.get('basicsLicense.copyrightHolders') === '' ||
                !this.get('basicsLicense.copyrightHolders.length') ||
                this.get('basicsLicense.copyrightHolders') === null)) return true;
        }
        return false;
    }),

    // Fields used in the "basics" section of the form.
    originalPublicationDateChanged: computed('model.originalPublicationDate', 'basicsOriginalPublicationDate', function () {
        const basicsOriginalPublicationDate = this.get('basicsOriginalPublicationDate');
        const modelOriginalPublicationDate = this.get('model.originalPublicationDate');
        return (basicsOriginalPublicationDate || modelOriginalPublicationDate)
            && basicsOriginalPublicationDate !== modelOriginalPublicationDate;
    }),

    // Pending subjects
    subjectsList: computed('model.subjects.@each', function() {
        return this.get('model.subjects') ? $.extend(true, [], this.get('model.subjects')) : A();
    }),

    // Flattened subject list
    disciplineReduced: computed('model.subjects', function() {
        return $.extend(true, [], this.get('model.subjects')).reduce((acc, val) => acc.concat(val), []).uniqBy('id');
    }),

    // to determine if there has been a change.
    disciplineChanged: computed('model.subjects.@each.subject', 'subjectsList.@each.subject', 'disciplineModifiedToggle', function () {
        return JSON.stringify(subjectIdMap(this.get('model.subjects'))) !== JSON.stringify(subjectIdMap(this.get('subjectsList')));
    }),

    // True if the current user has admin permissions to the preprint
    isAdmin: computed('model.currentUserPermissions', function() {
        return (this.get('model.currentUserPermissions') || []).includes(permissions.ADMIN);
    }),

    workflow: computed('moderationType', function () {
        return WORKFLOW[this.get('moderationType')];
    }),

    providerName: computed('currentProvider', function() {
        return this.get('currentProvider.id') !== 'osf' ?
            this.get('currentProvider.name') :
            this.get('i18n').t('global.brand_name');
    }),
    modalTitle: computed('moderationType', function() {
        if (this.get('editMode')) {
            return MODAL_TITLE.resubmit;
        }
        return this.get('moderationType') === PRE_MODERATION ?
            MODAL_TITLE.submit :
            MODAL_TITLE.create;
    }),

    // submission
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

    // edit
    showInformation: computed('moderationType', 'model.reviewsState', function() {
        const state = this.get('model.reviewsState');
        const modType = this.get('moderationType');
        return !(state === ACCEPTED || (modType === POST_MODERATION && state === PENDING));
    }),
    editInformation1: computed('moderationType', function() {
        const moderationType = this.get('moderationType');
        if (moderationType) {
            return EDIT_MESSAGES.line1[moderationType];
        }
    }),
    editInformation2: computed('moderationType', 'model.reviewsState', function() {
        const reviewsState = this.get('model.reviewsState');
        const moderationType = this.get('moderationType');
        if (reviewsState && moderationType) {
            return EDIT_MESSAGES.line2[reviewsState][moderationType];
        }
    }),
    canResubmit: computed('moderationType', 'model.reviewsState', function() {
        const state = this.get('model.reviewsState');
        return this.get('moderationType') === PRE_MODERATION && (state === PENDING || state === REJECTED);
    }),

    actions: {
        getProjectContributors(node) {
            // Returns all contributors of node.  Can be optionally added to the preprint.
            // Makes sequential requests to API until all pages of contributors have been loaded
            // and combines into one array

            // Cannot be called until a project has been selected!
            if (!this.get('node')) return;

            const contributors = A();
            loadAll(node, 'contributors', contributors).then(() =>
                this.set('projectContributors', contributors));
        },
        getPreprintContributors() {
            // Returns all contributors of a preprint.
            // Makes sequential requests to API until all pages of contributors have been loaded
            // and combines into one array

            // Cannot be called until a project has been selected!
            const model = this.get('model');
            if (!model) return;

            const contributors = A();
            loadAll(model, 'contributors', contributors).then(() =>
                this.set('contributors', contributors));
        },
        // This gets called by the save method of the license-widget, which in autosave mode
        // gets called every time a change is observed in the widget.
        editLicense(basicsLicense, licenseValid) {
            this.setProperties({
                basicsLicense,
                licenseValid,
            });
        },

        next(currentPanelName) {
            // Open next panel
            if (currentPanelName === 'Upload' || currentPanelName === 'Basics') {
                run.scheduleOnce('afterRender', this, function() {
                    MathJax.Hub.Queue(['Typeset', MathJax.Hub, $(currentPanelName === 'Upload' ? '.preprint-header-preview' : '.abstract')[0]]);
                });
            }
            if (currentPanelName === 'Authors') {
                this.get('metrics')
                    .trackEvent({
                        category: 'button',
                        action: 'click',
                        label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Authors Next Button`,
                    });
            }
            this.get('panelActions').close(this.get(`_names.${this.get('_names').indexOf(currentPanelName)}`));
            if (!(this.get('_names').indexOf(currentPanelName) > this.get('_names').length)) {
                this.get('panelActions').open(this.get(`_names.${this.get('_names').indexOf(currentPanelName) + 1}`));
                this.set('currentPanelName', this.get(`_names.${this.get('_names').indexOf(currentPanelName) + 1}`));
            }
            this.send('changesSaved', currentPanelName);
        },
        nextUploadSection(currentUploadPanel, nextUploadPanel) {
            // Opens next panel within the Upload Sectiod - Selecting a file
            // from an existing project
            // (Choose Project - Choose File - Finalize Upload)
            this.get('panelActions').toggle(currentUploadPanel);
            this.get('panelActions').toggle(nextUploadPanel);
        },
        changesSaved(currentPanelName) {
            // Temporarily changes panel save state to true.
            // Used for flashing 'Changes Saved' in UI.
            const currentPanelSaveState = `${currentPanelName.toLowerCase()}SaveState`;
            this.set(currentPanelSaveState, true);
            run.later(this, () => {
                this.set(currentPanelSaveState, false);
            }, 3000);
        },

        error(error /* , transition */) {
            this.get('toast').error(error);
        },
        /*
          Upload section
         */
        changeInitialState(newState) {
            // Sets filePickerState to start, new, or existing -
            // Do you want to upload a `new` preprint file, or choose an
            // `existing` file from a project
            // this is the initial decision on the form.
            this.set('filePickerState', newState);
            this.send('clearDownstreamFields', 'allUpload');
            if (newState === this.get('_State').NEW) {
                this.get('metrics')
                    .trackEvent({
                        category: 'button',
                        action: 'click',
                        label: 'Submit - Select a file from your computer',
                    });
            } else if (newState === this.get('_State').EXISTING) {
                this.get('panelActions').open('chooseProject');
                this.get('panelActions').close('selectExistingFile');
                this.get('panelActions').close('uploadNewFile');
                this.get('panelActions').close('finalizeUpload');
                this.get('metrics')
                    .trackEvent({
                        category: 'button',
                        action: 'click',
                        label: 'Submit - Select a file from an existing OSF project',
                    });
            } else {
                this.get('metrics')
                    .trackEvent({
                        category: 'button',
                        action: 'click',
                        label: 'Submit - Back Button, Upload Section',
                    });
            }
        },

        finishUpload() {
            // Locks preprint so that preprint location cannot be modified.
            // Occurs after upload step is complete.
            // In editMode, preprintLocked is set to true.
            // Locks preprint and advances to next form section.
            this.setProperties({
                preprintLocked: true,
                file: null,
            });
            // Closes section, so all panels closed if Upload section revisited
            this.get('panelActions').close('uploadNewFile');
            this.send('next', this.get('_names.1'));
        },

        changeSupplementalPickerState(state) {
            // Sets supplementalPickerState to start, new, or existing
            this.set('supplementalPickerState', state);
            this.send('resetSupplemental');
        },

        setSupplementalTitleFromSelected() {
            // Sets supplemental project title in UI
            this.set('supplementalProjectTitle', this.get('selectedSupplementalProject.title'));
            this.set('pendingSupplementalProjectTitle', '');
            this.set('node', this.get('selectedSupplementalProject'));
            this.send('next', this.get('_names.5'));
        },

        setSupplementalProjectTitle() {
            this.set('supplementalProjectTitle', this.get('pendingSupplementalProjectTitle'));
            this.set('selectedSupplementalProject', null);
            this.send('next', this.get('_names.5'));
        },

        resetSupplemental() {
            if (this.get('editMode')) {
                if (this.get('selectedSupplementalProject')) {
                    this.set('selectedSupplementalProject', null);
                }
                if (this.get('pendingSupplementalProjectTitle')) {
                    this.set('pendingSupplementalProjectTitle', '');
                }
            } else {
                if (this.get('selectedSupplementalProject') !== this.get('node')) {
                    this.set('selectedSupplementalProject', null);
                } else {
                    this.set('pendingSupplementalProjectTitle', '');
                }
            }
        },

        noSupplementalNode() {
            this.set('pendingSupplementalProjectTitle', '');
            this.set('supplementalProjectTitle', '');
            this.set('selectedSupplementalProject', null);
            this.get('model').set('node', null);
            if (this.get('editMode')) {
                this.set('supplementalUnset', true);
                this.send('updateSupplementalNode');
            } else {
                this.send('next', this.get('_names.5'));
            }

        },

        updateSupplementalNode() {
            const model = this.get('model');
            if (this.get('selectedSupplementalProject') || this.get('supplementalUnset')) {
                this.set('model.node', this.get('selectedSupplementalProject'));
                return model.save()
                    .then(this._finishUpdatingSupplementalNode.bind(this))
                    .then(this._moveFromSupplemental.bind(this));
            } else {
                const node = this.get('store').createRecord('node', {
                    public: false,
                    category: 'project',
                    title: this.get('pendingSupplementalProjectTitle'),
                });
                this.set('model.node', node);
                return node.save()
                    .then(() => model.save())
                    .then(this._finishUpdatingSupplementalNode.bind(this))
                    .then(this._moveFromSupplemental.bind(this));
            }
        },

        createPreprintCopyFile() {
            // Creates a preprint and then copies the file from the selected
            // node to the preprint
            const model = this.get('model');
            model.set('title', this.get('title'));
            model.set('provider', this.get('currentProvider'));
            return model.save()
                .then(this._copyNodeFileToPreprint.bind(this))
                .catch(this._failedUpload.bind(this));
        },

        setPrimaryFile() {
            // Occurs in Upload section of Add Preprint form
            // when pressing 'Save and continue'. Sets the primary file
            // on the preprint model
            const model = this.get('model');
            model.set('primaryFile', this.get('selectedFile'));

            return model.save()
                .then(this._finishUpload.bind(this))
                .catch(this._failedUpload.bind(this));
        },
        // Takes file chosen from file-browser and sets equal to selectedFile.
        // This file will be copied to the preprint
        selectExistingFile(file) {
            this.set('selectedFile', file);
        },

        // Discards upload section changes.  Restores displayed file to current preprint primaryFile
        // and resets displayed title to current preprint title. (No requests sent, front-end only.)
        discardUploadChanges() {
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Discard Upload Changes`,
                });

            this.setProperties({
                file: null,
                selectedFile: this.get('store').peekRecord('file', this.get('model.primaryFile.id')),
                title: this.get('model.title'),
                titleValid: true,
            });
        },

        // If user goes back and changes a section inside Upload,
        // all fields downstream of that section need to clear.
        clearDownstreamFields(section) {
            // Only clear downstream fields in Add mode!
            if (this.get('preprintLocked')) { return; }

            const props = [];

            /* eslint-disable no-fallthrough */
            switch (section) {
            case 'allUpload':
                props.push('node');
            case 'belowNode':
                props.push('selectedFile', 'file');
            case 'belowFile':
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
        discardBasics() {
            // Discards changes to basic fields. (No requests sent, front-end only.)
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Discard Basics Changes`,
                });
            this.set('basicsTags', this.get('model.tags').slice(0).map(fixSpecialChar));
            this.set('basicsAbstract', this.get('model.description'));
            this.set('basicsDOI', this.get('model.doi'));
            this.set('basicsOriginalPublicationDate', this.get('model.originalPublicationDate'));
            this.get('model.license').then(this._setBasicsLicense.bind(this));
        },
        preventDefault(e) {
            e.preventDefault();
        },
        stripDOI() {
            // Replaces the inputted doi link with just the doi itself
            this.get('metrics')
                .trackEvent({
                    category: 'input',
                    action: 'onchange',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - DOI Text Change`,
                });
            const basicsDOI = this.get('basicsDOI');
            this.set('basicsDOI', extractDoiFromString(basicsDOI));
        },
        saveBasics() {
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Save and Continue Basics Section`,
                });
            // Saves the description/tags on the node and the DOI on the preprint,
            // then advances to next panel
            if (!this.get('basicsValid')) {
                return;
            }

            const model = this.get('model');

            const copyrightHolders = this.get('basicsLicense.copyrightHolders')
                .split(', ')
                .map(item => item.trim());

            if (this.get('abstractChanged')) { model.set('description', this.get('basicsAbstract')); }

            if (this.get('tagsChanged')) { model.set('tags', this.get('basicsTags')); }

            if (this.get('doiChanged')) {
                model.set('doi', this.get('basicsDOI') || null);
            }

            if (this.get('originalPublicationDateChanged')) {
                model.set('originalPublicationDate', this.get('basicsOriginalPublicationDate') || null);
            }

            if (this.get('licenseChanged') || !this.get('model.license.name')) {
                model.setProperties({
                    licenseRecord: {
                        year: this.get('basicsLicense.year'),
                        copyright_holders: copyrightHolders,
                    },
                    license: this.get('basicsLicense.licenseType'),
                });
                this.get('metrics')
                    .trackEvent({
                        category: 'dropdown',
                        action: 'select',
                        label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Edit License`,
                    });
            }

            this.set('model', model);

            model.save()
                .then(this._moveFromBasics.bind(this))
                .catch(this._failMoveFromBasics.bind(this));
        },

        saveOriginalValues() {
            // Saves off current server-state basics fields,
            // so UI can be restored in case of failure
            const model = this.get('model');

            const currentAbstract = model.get('description');
            const currentTags = model.get('tags').slice();
            const currentDOI = model.get('doi');
            const currentOriginalPublicationDate = model.get('originalPublicationDate');
            const currentLicenseType = model.get('license');
            const currentLicenseRecord = model.get('licenseRecord');

            model.setProperties({
                licenseRecord: currentLicenseRecord,
                license: currentLicenseType,
                doi: currentDOI,
                originalPublicationDate: currentOriginalPublicationDate,
                description: currentAbstract,
                tags: currentTags,
            });

            this.set('model', model);
            return model.save();
        },

        // Custom addATag method that appends tag to list instead of auto-saving
        addTag(tag) {
            this.get('metrics')
                .trackEvent({
                    category: 'input',
                    action: 'onchange',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Add Tag`,
                });

            this.get('basicsTags').pushObject(tag);
        },

        // Custom removeATag method that removes tag from list instead of auto-saving
        removeTag(tag) {
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Remove Tag`,
                });

            this.get('basicsTags').removeObject(tag);
        },

        /*
          Discipline section
        */

        discardSubjects() {
            // Discards changes to subjects. (No requests sent, front-end only.)
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Discard Discipline Changes`,
                });
            this.set('subjectsList', $.extend(true, [], this.get('model.subjects')));
        },

        saveSubjects(currentSubjects, hasChanged) {
            // Saves subjects (disciplines) and then moves to next section.
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Discipline Save and Continue`,
                });

            const sendNext = () => this.send('next', this.get('_names.2'));

            if (!hasChanged) {
                return sendNext();
            }

            const model = this.get('model');
            const currentSubjectList = currentSubjects;

            model.set('subjects', subjectIdMap(currentSubjectList));
            model.save()
                .then(this._moveFromDisciplines.bind(this))
                .catch(this._failMoveFromDisciplines.bind(this));
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
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Search for Authors`,
                });
            return this.store.query('user', {
                filter: {
                    'full_name,given_name,middle_names,family_name': query,
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
        highlightSuccessOrFailure(elementId, context, status) {
            const highlightClass = `${status === 'success' ? 'success' : 'error'}Highlight`;

            context.$(`#${elementId}`).addClass(highlightClass);

            run.later(() => context.$(`#${elementId}`).removeClass(highlightClass), 2000);
        },
        /*
          Submit tab actions
         */
        clickSubmit() {
            if (this.get('allSectionsValid')) {
                // Toggles display of share preprint modal
                this.get('metrics')
                    .trackEvent({
                        category: 'button',
                        action: 'click',
                        label: 'Submit - Open Share Preprint Modal',
                    });
                this.toggleProperty('showModalSharePreprint');
            } else {
                this.get('metrics')
                    .trackEvent({
                        category: 'button',
                        action: 'click',
                        label: 'Submit - Display validation errors',
                    });
                this.set('attemptedSubmit', true);
            }
        },
        savePreprint() {
            // Finalizes saving of preprint.  Publishes preprint.
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit - Complete Preprint Edits' : 'Submit - Share Preprint'}`,
                });

            const model = this.get('model');
            this.set('savingPreprint', true);
            this.toggleProperty('shareButtonDisabled');
            model.set('provider', this.get('currentProvider'));

            const isModerated = this.get('moderationType');
            if (!isModerated) {
                model.set('isPublished', true);
            }
            this.set('model', model);

            return model.save()
                .then(this._saveSupplementalProject.bind(this))
                .then(this._savePreprint.bind(this))
                .catch(this._failSaveModel.bind(this));
        },
        cancel() {
            this.transitionToRoute('index');
        },
        resubmit() {
            this.set('savingPreprint', true);
            this.toggleProperty('shareButtonDisabled');

            const submitAction = this.get('store').createRecord('review-action', {
                actionTrigger: 'submit',
                target: this.get('model'),
            });

            this.set('submitAction', submitAction);

            return submitAction.save()
                .then(this._transitionToPreprint.bind(this))
                .catch(this._transitionToPreprintError.bind(this));
        },
        returnToSubmission() {
            this.transitionToRoute(
                `${this.get('theme.isSubRoute') ? 'provider.' : ''}content`,
                this.get('model'),
            );
        },
        selectProvider(provider) {
            this.set('selectedProvider', provider);
            this.set('providerChanged', true);
        },
        saveProvider() {
            this.set('currentProvider', this.get('selectedProvider'));
            this.get('currentProvider').queryHasMany('licensesAcceptable', { 'page[size]': 20 }).then(this._setAvailableLicense.bind(this));
            this.set('providerChanged', false);
            this.set('providerSaved', true);
            this.send('discardSubjects');
            this.send('next', this.get('_names.0'));
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `Submit - Save and continue, Select ${this.get('currentProvider.name')} preprint service`,
                });
        },
        discardProvider() {
            this.set('selectedProvider', this.get('currentProvider'));
            this.set('providerChanged', false);
        },
    },

    _setCurrentProvider() {
        this.get('store')
            .findAll('preprint-provider', { reload: true })
            .then(this._getProviders.bind(this));
    },

    _savePreprint() {
        const isModerated = this.get('moderationType');
        const preprint = this.get('model');

        this.set('preprintSaved', true);
        if (isModerated) {
            const submitAction = this.get('store').createRecord('review-action', {
                actionTrigger: 'submit',
                target: preprint,
            });
            submitAction.save().then(() => this._providerRouteTransition(preprint.id));
        } else {
            this._providerRouteTransition(preprint.id);
        }
    },

    _saveSupplementalProject() {
        const model = this.get('model');
        if (this.get('selectedSupplementalProject')) {
            model.set('node', this.get('selectedSupplementalProject'));
            return model.save();
        } else if (this.get('supplementalProjectTitle')) {
            const node = this.get('store').createRecord('node', {
                public: false,
                category: 'project',
                title: this.get('supplementalProjectTitle'),
            });
            this.set('model.node', node);
            return node.save()
                .then(() => model.save())
                .then(this._savePreprint.bind(this));
        }
    },

    _providerRouteTransition(preprintId) {
        let useProviderRoute = false;
        if (this.get('theme.isProvider')) {
            useProviderRoute = this.get('theme.isSubRoute');
        } else if (this.get('currentProvider.domain') && this.get('currentProvider.domainRedirectEnabled')) {
            window.location.replace(`${this.get('currentProvider.domain')}${preprintId}`);
        } else if (this.get('currentProvider.id') !== 'osf') {
            useProviderRoute = true;
        }
        this.transitionToRoute(`${useProviderRoute ? 'provider.' : ''}content`, this.get('model').reload());
    },

    _failSaveModel() {
        this.toggleProperty('shareButtonDisabled');
        return this.get('toast')
            .error(this.get('i18n')
                .t(`submit.error_${this.get('editMode') ? 'completing' : 'saving'}_preprint`));
    },

    _failSaveSupplementalProject() {
        this.set('selectedSupplementalProject', null);
        return this.get('toast')
            .error(this.get('i18n')
                .t('submit.error_saving_supplemental'));
    },


    _getProviders(providers) {
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
    },

    _setNodeTitle() {
        const model = this.get('model');

        const currentPreprintTitle = model.get('title');
        const title = this.get('title');

        if (currentPreprintTitle === title) {
            return;
        }
        model.set('title', title);
        return model.save();
    },

    _failSetNodeTitle() {
        const model = this.get('model');
        const currentPreprintTitle = model.get('title');

        model.set('title', currentPreprintTitle);
        this.get('toast').error(this.get('i18n').t('submit.could_not_update_title'));
    },

    _copyNodeFileToPreprint() {
        const preprint = this.get('model');
        preprint.get('files')
            .then(this._getFiles.bind(this))
            .catch(this._failGetFiles.bind(this));
    },

    _getFiles(fileProviders) {
        const preprint = this.get('model');
        const osfstorage = fileProviders.findBy('name', 'osfstorage');

        this.get('fileManager').copy(this.get('selectedFile'), osfstorage, { data: { resource: preprint.id, provider: 'osfstorage', conflict: 'replace' } })
            .then(this._copyFile.bind(this))
            .catch(this._failCopyFile.bind(this));
    },

    _copyFile(copiedFile) {
        this.set('selectedFile', copiedFile);
        const model = this.get('model');
        model.set('primaryFile', this.get('selectedFile'));
        return model.save()
            .then(this._finishUpload.bind(this))
            .catch(this._failedUpload.bind(this));
    },

    _failCopyFile() {
        this.get('toast').error(this.get('i18n').t('submit.error_copying_file'));
    },

    _failGetFiles() {
        this.get('toast').error(this.get('i18n').t('submit.error_accessing_parent_files'));
    },

    _failDeletePreprint() {
        this.get('toast').error(this.get('i18n').t(
            'submit.abandoned_preprint_error',
            {
                documentType: this.get('currentProvider.documentType'),
            },
        ));
    },

    _finishUpload() {
        this.send('getPreprintContributors');

        // Sets upload form state to existing project (now that project has been created)
        this.set('filePickerState', State.EXISTING);
        // Sets file state to new file, for edit mode.
        this.set('existingState', existingState.NEWFILE);
        this.set('file', null);
        this.get('toast').info(this.get('i18n').t('submit.preprint_file_uploaded', {
            documentType: this.get('currentProvider.documentType'),
        }));
        this.send('finishUpload');
    },

    _failedUpload() {
        // Allows user to attempt operation again.
        this.set('uploadInProgress', false);
        this.get('toast').error(this.get('i18n').t(
            'submit.error_initiating_preprint',
            {
                documentType: this.get('currentProvider.documentType'),
            },
        ));
    },

    _finishUpdatingSupplementalNode() {
        this.set('node', this.get('model.node'));
        this.set('supplementalUnset', false);
        this.set('supplementalProjectTitle', this.get('node').get('title'));
    },

    _setBasicsLicense(license) {
        const date = new Date();

        this.set('basicsLicense', {
            licenseType: license || this.get('availableLicenses').toArray()[0],
            year: this.get('model.licenseRecord') ? this.get('model.licenseRecord').year : date.getUTCFullYear().toString(),
            copyrightHolders: this.get('model.licenseRecord') ? this.get('model.licenseRecord').copyright_holders.join(', ') : '',
        });
    },

    _moveFromBasics() {
        this.send('next', this.get('_names.3'));
    },

    _moveFromSupplemental() {
        this.send('next', this.get('_names.5'));
    },

    _failMoveFromBasics() {
        // If model save fails, do not transition, save original vales
        this.get('toast').error(this.get('i18n').t('submit.basics_error'));
        this.send('saveOriginalValues');
    },

    _moveFromDisciplines() {
        this.send('next', this.get('_names.2'));
    },

    _failMoveFromDisciplines() {
        // Current subjects saved so UI can be restored in case of failure
        const model = this.get('model');

        model.set('subjects', $.extend(true, [], this.get('model.subjects')));
        this.get('toast').error(this.get('i18n').t('submit.disciplines_error'));
    },

    _setContributorSearchResults(contributors) {
        this.set('searchResults', contributors);
        return contributors;
    },

    _setContributorSearchResultsError() {
        this.get('toast').error(this.get('i18n').t('submit.search_contributors_error'));
        this.highlightSuccessOrFailure('author-search-box', this, 'error');
    },

    _saveModel() {
        const model = this.get('model');

        model.save();
    },

    _submitAction() {
        const submitAction = this.get('submitAction');

        submitAction.save();
    },

    _saveChanges() {
        const model = this.get('model');

        this.set('preprintSaved', true);
        let useProviderRoute = false;
        if (this.get('theme.isProvider')) {
            useProviderRoute = this.get('theme.isSubRoute');
        } else if (this.get('currentProvider.domain') && this.get('currentProvider.domainRedirectEnabled')) {
            window.location.replace(`${this.get('currentProvider.domain')}${model.id}`);
        } else if (this.get('currentProvider.id') !== 'osf') {
            useProviderRoute = true;
        }
        this.transitionToRoute(
            `${useProviderRoute ? 'provider.' : ''}content`,
            model.reload(),
        );
    },

    _saveChangesError() {
        this.toggleProperty('shareButtonDisabled');
        return this.get('toast')
            .error(this.get('i18n')
                .t(`submit.error_${this.get('editMode') ? 'completing' : 'saving'}_preprint`));
    },

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

    _setAvailableLicense(licenses) {
        this.set('availableLicenses', licenses);
        this.set('basicsLicense.licenseType', this.get('availableLicenses.firstObject'));
    },

    clearFields() {
        // Restores submit form defaults.
        // Called when user submits preprint, then hits back button, for example.
        this.get('panelActions').open('Upload');

        this.setProperties(merge(this.get('_names').reduce((acc, name) => merge(acc, { [`${name.toLowerCase()}SaveState`]: false }), {}), {
            filePickerState: State.START,
            existingState: existingState.CHOOSE,
            supplementalPickerState: State.START,
            user: null,
            userNodes: A(),
            userNodesLoaded: false,
            node: null,
            file: null,
            uploadedFileId: null,
            uploadedFileName: false,
            selectedFile: null,
            selectedSupplementalProject: null,
            title: '',
            supplementalProjectTitle: '',
            pendingSupplementalProjectTitle: '',
            preprintLocked: false, // Will be set to true if edit?
            searchResults: [],
            savingPreprint: false,
            showModalSharePreprint: false,
            serverSaveState: false,
            uploadSaveState: false,
            disciplineSaveState: false,
            basicsSaveState: false,
            authorsSaveState: false,
            suppplementalSaveState: false,
            osfStorageProvider: null,
            osfProviderLoaded: false,
            titleValid: null,
            supplementalProjectTitleValid: null,
            supplementalProjectTitleUpdatedValid: null,
            uploadInProgress: false,
            existingPreprints: A(),
            editMode: false,
            shareButtonDisabled: false,
            attemptedSubmit: false,
            // Basics and subjects fields need to be reset because
            // the Add process overwrites the computed properties as reg properties
            basicsTags: A(),
            basicsAbstract: null,
            basicsDOI: null,
            basicsOriginalPublicationDate: null,
            basicsLicense: null,
            subjectsList: A(),
            availableLicenses: A(),
            contributors: A(),
            projectContributors: A(),
        }));
    },

    // Preprint file picker state - new preprint file, or existing file that we
    // copy from project?
    filePickerState: State.START,
    existingState: existingState.CHOOSE,
    supplementalPickerState: State.START,
});
