import { A } from '@ember/array';
import EmberObject, { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { getOwner } from '@ember/application';
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

// Enum of available upload states > new preprint file, existing project file,
// new file version
export const State = Object.freeze(EmberObject.create({
    START: 'start',
    NEW: 'new',
    EDIT: 'edit',
    EXISTING: 'existing',
    VERSION: 'version',
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

const COIValidations = buildValidations({
    coiStatement: {
        description: 'COI',
        validators: [
            validator('presence', true),
            validator('length', {
                min: 10,
                max: 5000,
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
export default Controller.extend(Analytics, BasicsValidations, COIValidations, NodeActionsMixin, TaggableMixin, {
    features: service(),
    i18n: service(),
    store: service(),
    theme: service(),
    fileManager: service(),
    toast: service('toast'),
    panelActions: service('panelActions'),

    // Data for project picker; tracked internally on load
    user: null,

    _State: State,
    // Project that preprint file was copied from, or supplemental project (in edit mode)
    // Same variable used for both.
    node: null,
    // Preuploaded file - file dragged to dropzone, but not uploaded to preprint
    file: null,
    // Preuploaded file id - saved off in case file upload succeeds but preprint request fails
    uploadedFileId: null,
    // Saved off in case file upload succeeds but preprint request fails
    uploadedFileName: false,
    // File that will be the preprint
    selectedFile: null,
    // Pending supplemental project that will be set as the supplemental project on the node
    selectedSupplementalProject: null,
    // Preprint title
    title: '',
    // Supplemental Project Title
    supplementalProjectTitle: '',
    // Pending Supplemental Project Title - not yet saved
    pendingSupplementalProjectTitle: '',
    // The preprint is locked.  Is always true on Edit, and true after Upload on Submit
    preprintLocked: false,
    // List of users matching search query
    searchResults: [],
    // True when Share button is pressed on Add Preprint page
    savingPreprint: false,
    // True when sharing preprint confirmation modal is displayed
    showModalSharePreprint: false,
    // True temporarily when changes have been saved in server section
    serverSaveState: false,
    // True temporarily when changes have been saved in upload section
    uploadSaveState: false,
    // True temporarily when changes have been saved in discipline section
    disciplineSaveState: false,
    // True temporarily when changes have been saved in basics section
    basicsSaveState: false,
    // True temporarily when changes have been saved in authors section
    authorsSaveState: false,
    // True temporarily when changes have been saved in coi section
    coiSaveState: false,
    // True temporarily when changes have been saved in the supplemental section
    supplementalSaveState: false,
    // Preprint node's osfStorage object
    osfStorageProvider: null,
    // Preprint node's osfStorageProvider is loaded.
    osfProviderLoaded: false,
    // If preprint's pending title is valid.
    titleValid: null,
    // If updated supplemental project title is valid.
    supplementalProjectTitleValid: null,
    // Used to determine whether supplemental project title should be prepopulated
    firstSupplementalOpen: true,
    // Set to true when upload step is underway
    uploadInProgress: false,
    // Edit mode is false by default.
    editMode: false,
    shareButtonDisabled: false,
    attemptedSubmit: false,
    // Initialize with an empty list of providers
    allProviders: [],
    currentProvider: undefined,
    selectedProvider: undefined,
    providerSaved: false,
    preprintSaved: false,
    submitAction: null,
    // Auther assertion properties
    // initialCoi: undefined,

    // Validation rules and changed states for form sections

    providerChanged: true,

    // Must have year and copyrightHolders filled if those are required by the licenseType selected
    licenseValid: false,

    _names: computed('shouldShowCoiPanel', 'shouldShowAuthorAssertionsPanel', function() {
        if (this.get('shouldShowCoiPanel')) {
            return ['Server', 'File', 'Basics', 'Discipline', 'Authors', 'COI', 'Supplemental'];
        }
        if (this.get('shouldShowCoiPanel') && this.get('shouldShowAuthorAssertionsPanel')) {
            return ['Server', 'File', 'Assertions', 'Basics', 'Discipline', 'Authors', 'COI', 'Supplemental'];
        }
        return ['Server', 'File', 'Basics', 'Discipline', 'Authors', 'Supplemental'];
    }),
    hasFile: computed.or('file', 'selectedFile'),
    isAddingPreprint: computed.not('editMode'),
    // Contributors on preprint
    contributors: A(),
    projectContributors: A(),
    userNodes: A(),
    availableLicenses: A(),
    uploadValid: alias('preprintLocked'), // Once the preprint has been locked (happens in step one of upload section), users are free to navigate through form unrestricted
    abstractValid: alias('validations.attrs.basicsAbstract.isValid'),

    doiValid: alias('validations.attrs.basicsDOI.isValid'),
    originalPublicationDateValid: alias('validations.attrs.basicsOriginalPublicationDate.isValid'),

    coiStatementValid: alias('validations.attrs.coiStatement.isValid'),

    // Sloan waffles
    sloanCoiInputEnabled: alias('features.sloanCoiInput'),
    sloanDataInputEnabled: alias('features.sloanDataInput'),
    sloanPreregInputEnabled: alias('features.sloanPreregInput'),

    // Variable controlled by sloan waffle flags
    shouldShowAuthorAssertionsPanel: computed('sloanDataInputEnabled', 'sloanPreregInputEnabled', 'currentProvider.inSloanStudy', function () {
        if (!this.get('currentProvider.inSloanStudy')) {
            return false;
        }
        return this.get('sloanPreregInputEnabled') || this.get('sloanDataInputEnabled');
    }),

    shouldShowCoiPanel: computed.and('sloanCoiInputEnabled', 'currentProvider.inSloanStudy'),

    // Basics fields that are being validated are abstract, license and doi
    // (title validated in upload section). If validation
    // added for other fields, expand basicsValid definition.
    basicsValid: computed.and('abstractValid', 'doiValid', 'licenseValid', 'originalPublicationDateValid'),

    // Must have at least one contributor. Backend enforces admin and bibliographic rules.
    // If this form section is ever invalid, something has gone horribly wrong.
    authorsValid: computed.bool('contributors.length'),

    // Determines if Authors panel should be open by default - Read contributors
    // have this panel open on the Edit page - as this is the only panel they can view
    authorsOpen: computed.not('canEdit'),

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

    // Does preprint have saved coi?
    savedCoi: computed.notEmpty('model.hasCoi'),

    // Preprint can be published once all required sections have been saved.
    allSectionsValid: computed('savedTitle', 'savedFile', 'savedAbstract', 'savedSubjects', 'authorsValid', 'savedCoi', function() {
        if (this.get('shouldShowCoiPanel')) {
            return this.get('savedTitle') && this.get('savedFile')
            && this.get('savedAbstract') && this.get('savedSubjects')
            && this.get('authorsValid') && this.get('savedCoi');
        }
        return this.get('savedTitle') && this.get('savedFile')
            && this.get('savedAbstract') && this.get('savedSubjects')
            && this.get('authorsValid');
    }),

    // Are there any unsaved changes in the upload section?
    uploadChanged: computed.or('preprintFileChanged', 'titleChanged'),

    basicsDOI: computed.or('model.doi'),

    // This is done to initialize basicsOriginalPublicationDate to the date fetched
    // from an existing preprint, similar to how basicsDOI is initialized.
    basicsOriginalPublicationDate: computed.or('model.originalPublicationDate'),

    // Are there any unsaved changes in the basics section?
    basicsChanged: computed.or('tagsChanged', 'abstractChanged', 'doiChanged', 'licenseChanged', 'originalPublicationDateChanged'),

    // Are there any unsaved changes in the coi section?
    coiChanged: computed.or('coiStatementChanged', 'coiOptionChanged'),

    moderationType: alias('currentProvider.reviewsWorkflow'),

    supplementalChanged: computed('supplementalProjectTitle', 'pendingSupplementalProjectTitle', 'selectedSupplementalProject', 'node', function() {
        const savedTitle = this.get('supplementalProjectTitle');
        const pendingNewProjectTitle = this.get('pendingSupplementalProjectTitle');
        const pendingExistingProjectTitle = this.get('selectedSupplementalProject.title');

        if (this.get('node')) {
            // If supplemental project has already been saved
            return (this.get('selectedSupplementalProject.id') && this.get('node.id') !== this.get('selectedSupplementalProject.id')) ||
                !!(pendingNewProjectTitle);
        }

        // If pending supplemental changes different from staged changes
        return (pendingNewProjectTitle && pendingNewProjectTitle !== savedTitle) ||
            (pendingExistingProjectTitle && pendingExistingProjectTitle !== savedTitle);
    }),

    supplementalDocumentType: computed('i18n', function () {
        const locale = getOwner(this).factoryFor(`locale:${this.get('i18n.locale')}/translations`).class;
        return locale.documentType.supplementalProject;
    }),

    // True if fields have been changed
    hasDirtyFields: computed('theme.isProvider', 'hasFile', 'preprintSaved', 'isAddingPreprint', 'providerSaved', 'uploadChanged', 'basicsChanged', 'disciplineChanged', 'coiChanged', function() {
        const preprintStarted = this.get('theme.isProvider') ? this.get('hasFile') : this.get('providerSaved');
        const fieldsChanged = this.get('uploadChanged') || this.get('basicsChanged') || this.get('disciplineChanged') || this.get('coiChanged');
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

        const basicsNoModel = basicsOriginalPublicationDate && !modelOriginalPublicationDate;
        const modelNoBasics = modelOriginalPublicationDate && !basicsOriginalPublicationDate;
        const basicsAndModel = basicsOriginalPublicationDate && modelOriginalPublicationDate;

        return basicsNoModel || modelNoBasics || (basicsAndModel &&
            modelOriginalPublicationDate.getTime() !== basicsOriginalPublicationDate.getTime());
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

    // True if the current user has write permissions to the preprint
    isWrite: computed('model.currentUserPermissions', function() {
        return (this.get('model.currentUserPermissions') || []).includes(permissions.WRITE);
    }),

    canEdit: computed('isWrite', 'editMode', function() {
        // If logged in user has permission to edit - true
        // on editMode for both admin and write authors
        return this.get('editMode') ? this.get('isWrite') : true;
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
            let message = EDIT_MESSAGES.line2[reviewsState][moderationType];
            if (reviewsState === 'rejected' && moderationType === 'pre-moderation' && !(this.get('isAdmin'))) {
                // Write contribs have permission to edit preprints but cannot resubmit
                message = 'submit.body.edit.resubmit_help_text';
            }
            return message;
        }
    }),
    canResubmit: computed('moderationType', 'model.reviewsState', function() {
        const state = this.get('model.reviewsState');
        return this.get('moderationType') === PRE_MODERATION && (state === PENDING || state === REJECTED) && this.get('isAdmin');
    }),
    canWithdraw: computed('moderationType', 'model.reviewsState', function() {
        const state = this.get('model.reviewsState');
        return (state === PENDING || state === ACCEPTED) && this.get('isAdmin');
    }),
    // Assertion panels
    coiStatement: computed('model.conflictOfInterestStatement', function() {
        return this.get('model.conflictOfInterestStatement') || null;
    }),
    hasCoi: computed('model.hasCoi', function() {
        return this.get('model.hasCoi');
    }),
    coiOptionChanged: computed('hasCoi', 'model.hasCoi', function() {
        const hasCoi = this.get('hasCoi');
        return hasCoi !== undefined && hasCoi !== this.get('model.hasCoi');
    }),
    coiStatementChanged: computed('coiStatement', 'model.conflictOfInterestStatement', function() {
        const coiStatement = this.get('coiStatement');
        return coiStatement !== null && coiStatement !== undefined && coiStatement.trim() !== this.get('model.conflictOfInterestStatement');
    }),
    // Checks if the coi section is valid
    coiValid: computed('coiStatementValid', 'hasCoi', function() {
        const hasCoi = this.get('hasCoi');
        const coiStatementValid = this.get('coiStatementValid');
        if ((hasCoi && coiStatementValid) || hasCoi === false) {
            return true;
        }

        return false;
    }),

    actions: {
        getProjectContributors(node) {
            // Returns all contributors of the node.  Are copied over to the preprint.
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
            if (currentPanelName === 'File' || currentPanelName === 'Basics') {
                run.scheduleOnce('afterRender', this, function() {
                    MathJax.Hub.Queue(['Typeset', MathJax.Hub, $(currentPanelName === 'File' ? '.preprint-header-preview' : '.abstract')[0]]);
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
            // Opens next panel within the Upload Section - Selecting a file
            // from an existing project
            // (Choose Project - Choose File - Finalize Upload)
            this.get('panelActions')._panelFor(currentUploadPanel).set('apiOpenState', false);
            this.get('panelActions')._panelFor(currentUploadPanel).set('apiWasUsed', true);
            this.get('panelActions')._panelFor(nextUploadPanel).set('apiOpenState', true);
            this.get('panelActions')._panelFor(nextUploadPanel).set('apiWasUsed', true);
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
                        label: 'Submit - Choose select a file from your computer',
                    });
            } else if (newState === this.get('_State').EXISTING) {
                this.get('panelActions')._panelFor('chooseProject').set('apiOpenState', true);
                this.get('panelActions')._panelFor('chooseProject').set('apiWasUsed', true);
                this.get('metrics')
                    .trackEvent({
                        category: 'button',
                        action: 'click',
                        label: 'Submit - Choose select a file from an existing OSF project',
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
                node: null,
                uploadInProgress: false,
            });
            // Closes section, so all panels closed if Upload section revisited
            this.get('panelActions').close('uploadNewFile');
            this.send('next', this.get('_names.1'));
        },

        createPreprintCopyFile() {
            // Creates a preprint and then copies the file from the selected
            // node to the preprint
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Submit - Save and Continue, Create Preprint and Copy Node File to Preprint',
                });
            this.set('uploadInProgress', true);
            const model = this.get('model');
            model.set('title', this.get('title'));
            model.set('provider', this.get('currentProvider'));
            return model.save()
                .then(this._getFileProviders.bind(this))
                .catch(this._failedUpload.bind(this));
        },

        setPrimaryFile() {
            // Occurs in Upload section of Add Preprint form
            // when pressing 'Save and continue'. Sets the newly uploaded file
            // as the primary file on the preprint model.
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

        // If user goes back and changes a section inside the File section,
        // certain fields downstream of that section need to clear.
        clearDownstreamFields(section) {
            // Only clear downstream fields in Add mode!
            if (this.get('preprintLocked')) { return; }

            const props = [];

            /* eslint-disable no-fallthrough */
            switch (section) {
            case 'allUpload':
                props.push('node', 'title', 'titleValid');
            case 'belowNode':
                props.push('selectedFile', 'file');
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

            const sendNext = this._moveFromDisciplines.bind(this);

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
                q: this._processQuery(query),
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
        currentUserRemoved() {
            this.replaceRoute('index');
        },

        /*
        Update Auther Assertion Sections
        */
        updateCoi(val) {
            this.set('hasCoi', val);
        },
        discardCoi() {
            // Discards changes to basic fields. (No requests sent, front-end only.)
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Discard Coi Changes`,
                });
            this.set('hasCoi', this.get('model.hasCoi'));
            this.set('coiStatement', this.get('model.conflictOfInterestStatement'));
        },
        saveCoi() {
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Save and Continue Coi Section`,
                });
            // Saves the description on the node
            // then advances to next panel
            if (!this.get('coiValid')) {
                return;
            }

            const model = this.get('model');

            if (!this.get('hasCoi')) {
                this.set('coiStatement', undefined);
            }

            model.set('hasCoi', this.get('hasCoi'));
            model.set('conflictOfInterestStatement', this.get('coiStatement'));

            this.set('model', model);
            model.save()
                .then(this._moveFromCoi.bind(this))
                .catch(this._failMoveFromCoi.bind(this));
        },
        /*
        Supplemental Project Section
        */
        changeSupplementalPickerState(state) {
            // Sets supplementalPickerState to edit, start, new, or existing
            const buttonLabel = {
                existing: 'Choose Connect an existing OSF Project',
                new: 'Choose Create a new OSF project',
            };
            if (state === this.get('_State').NEW || state === this.get('_State').EXISTING) {
                this.get('metrics')
                    .trackEvent({
                        category: 'button',
                        action: 'click',
                        label: `${this.get('editMode') ? 'Edit' : 'Submit'} - ${buttonLabel[state]}`,
                    });
            }

            this.set('supplementalPickerState', state);
            this.send('discardSupplemental');
            if (this.get('firstSupplementalOpen') && state === this.get('_State').NEW) {
                // Populates the supplemental project title the first time
                // "Create a new OSF Project" is selected
                this.set('pendingSupplementalProjectTitle', `Supplemental materials for ${this.get('currentProvider.documentType.singular')}: ${this.get('model.title')}`);
                this.set('firstSupplementalOpen', false);
                this.set('supplementalProjectTitleValid', true);
            }
        },

        setSupplementalTitleFromSelected() {
            // Locally sets supplemental project title in UI - title taken from existing project.
            // When preprint submission is finalized, the selectedSupplemental project
            // will be set as the supplemental project on the preprint.
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Submit - Set existing project as supplemental',
                });
            this.set('supplementalProjectTitle', this.get('selectedSupplementalProject.title'));
            this.set('pendingSupplementalProjectTitle', '');
            this.set('node', this.get('selectedSupplementalProject'));
            this._moveFromSupplemental();
        },

        setSupplementalProjectTitle() {
            // Locally sets supplementalProjectTitle - Submit mode
            // When preprint submission is finalized, a supplemental project will
            // be created with this title.
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Submit - Set new project as supplemental',
                });
            this.set('supplementalProjectTitle', this.get('pendingSupplementalProjectTitle'));
            this.set('selectedSupplementalProject', null);
            this.set('node', null);
            this._moveFromSupplemental();
        },

        discardSupplemental() {
            // Locally resets supplemental project UI to latest save state
            if (this.get('editMode')) {
                if (this.get('selectedSupplementalProject') !== this.get('node')) {
                    this.set('selectedSupplementalProject', null);
                }
                if (this.get('pendingSupplementalProjectTitle')) {
                    this.set('pendingSupplementalProjectTitle', '');
                }
                this.set('supplementalProjectTitleValid', false);
            } else {
                if (this.get('selectedSupplementalProject')) {
                    this.set('selectedSupplementalProject', this.get('node'));
                    this.set('pendingSupplementalProjectTitle', '');
                } else {
                    this.set('pendingSupplementalProjectTitle', this.get('supplementalProjectTitle'));
                }
                this.set('supplementalProjectTitleValid', false);
            }
        },
        changeConnectedProject() {
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Choose Change the connected project`,
                });
            this.send('changeSupplementalPickerState', this.get('_State').START);
        },
        backSupplemental(state) {
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Back Button, Supplemental Section`,
                });
            this.send('changeSupplementalPickerState', state);
        },
        skipSupplemental() {
            // If "continue" is clicked, reset to proper form state.
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Continue Button, Supplemental Section`,
                });
            if (this.get('editMode') && this.get('node.id')) {
                this.send('changeSupplementalPickerState', this.get('_State').EDIT);
            } else {
                this.set('node', null);
                this.set('supplementalProjectTitle', '');
                // State set as "continue" temporarily for analytics purposes
                this.send('changeSupplementalPickerState', this.get('_State').START);
            }
            this._moveFromSupplemental();
        },

        removeSupplementalNode() {
            // Deletes the node from the preprint -
            const model = this.get('model');
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Edit - Remove Supplemental Project from Preprint',
                });
            if (this.get('editMode') && model.get('node.id')) {
                model.set('node', null);
                return model.save()
                    .then(this._successRemovingSupplementalNode.bind(this))
                    .catch(this._errorRemovingSupplementalNode.bind(this));
            }
        },

        updateSupplementalNode() {
            // For updating the supplemental project in edit mode - supplemental
            // project is updated immediately on the preprint.
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `Edit - Update supplemental project: ${this.get('selectedSupplementalProject') ? 'Existing Project' : 'New Project'}`,
                });
            return this._saveSupplementalProject()
                .then(this._finishUpdatingSupplementalNode.bind(this))
                .catch(this._errorUpdatingSupplemental.bind(this));
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
        clickWithdraw() {
            this.transitionToRoute(
                `${this.get('theme.isSubRoute') ? 'provider.' : ''}content.withdraw`,
                this.get('model'),
            );
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

            return this._saveSupplementalProject()
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
                .t(`submit.error_${this.get('editMode') ? 'completing' : 'saving'}_preprint`, {
                    documentType: this.get('currentProvider.documentType'),
                }));
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

    _getFileProviders() {
        const preprint = this.get('model');
        preprint.get('files')
            .then(this._copyNodeFileToPreprint.bind(this))
            .catch(this._failGetFiles.bind(this));
    },

    _copyNodeFileToPreprint(fileProviders) {
        const preprint = this.get('model');
        const osfstorage = fileProviders.findBy('name', 'osfstorage');

        if (this.get('uploadedFileName') === this.get('selectedFile.name')) {
            // If file was successfully copied to preprint and then subsequent request failed
            // Do not attempt to recopy to the preprint
            return this.get('store')
                .findRecord('file', this.get('uploadedFileId'))
                .then(this._setPrimaryFileAndNodeAttributes.bind(this))
                .catch(this._failCopyFile.bind(this));
        }

        this.get('fileManager').copy(this.get('selectedFile'), osfstorage, { data: { resource: preprint.id, provider: 'osfstorage', conflict: 'replace' } })
            .then(this._setPrimaryFileAndNodeAttributes.bind(this))
            .catch(this._failCopyFile.bind(this));
    },

    _setPrimaryFileAndNodeAttributes(copiedFile) {
        // Copied file from node is set as the preprint's primary file
        // Also copies over node description and tags
        this.set('selectedFile', copiedFile);
        this.set('uploadedFileName', copiedFile.get('name'));
        this.set('uploadedFileId', copiedFile.get('id'));
        const model = this.get('model');
        model.set('description', this.get('node.description'));
        this.set('basicsAbstract', this.get('node.description'));
        model.set('tags', this.get('node.tags'));
        model.set('primaryFile', copiedFile);
        return model.save()
            .then(this._addContributorsFromFileProject.bind(this))
            .then(this._finishUpload.bind(this))
            .catch(this._failedUpload.bind(this));
    },

    _failCopyFile() {
        this.get('toast').error(this.get('i18n').t('submit.error_copying_file'));
    },

    _failGetFiles() {
        this.get('toast').error(this.get('i18n').t('submit.error_accessing_files'));
    },

    _finishUpload() {
        this.send('getPreprintContributors');
        // Sets upload form state to existing project (now that project has been created)
        this.set('filePickerState', State.VERSION);
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

    _setBasicsLicense(license) {
        const date = new Date();

        this.set('basicsLicense', {
            licenseType: license || this.get('availableLicenses').toArray()[0],
            year: this.get('model.licenseRecord') ? this.get('model.licenseRecord').year : date.getUTCFullYear().toString(),
            copyrightHolders: this.get('model.licenseRecord') ? this.get('model.licenseRecord').copyright_holders.join(', ') : '',
        });
    },

    _moveFromBasics() {
        this.send('next', 'Basics');
    },

    _moveFromCoi() {
        this.send('next', 'COI');
    },

    _failMoveFromCoi() {
        // If model save fails, do not transition, save original vales
        this.get('toast').error(this.get('i18n').t('submit.coi_error'));
    },

    _moveFromSupplemental() {
        this.send('next', 'Supplemental');
    },

    _failMoveFromBasics() {
        // If model save fails, do not transition, save original vales
        this.get('toast').error(this.get('i18n').t('submit.basics_error'));
        this.send('saveOriginalValues');
    },

    _moveFromDisciplines() {
        this.send('next', 'Discipline');
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

    // Adds all contributors from node (where preprint file was copied)
    // to the preprint
    _addContributorsFromFileProject() {
        // Not catching errors adding contributors - not crucial that
        // those node contributors were copied over
        const contributorsToAdd = A();
        this.get('projectContributors').toArray().forEach((contributor) => {
            if (this.get('user.id') !== contributor.get('userId') &&
                !('errors' in contributor.get('data.links.relationships.users'))) {
                contributorsToAdd.push({
                    permission: contributor.get('permission'),
                    bibliographic: contributor.get('bibliographic'),
                    userId: contributor.get('userId'),
                    unregisteredContributor: contributor.get('unregisteredContributor'),
                });
            }
        });

        if (contributorsToAdd.length !== 0) {
            this.get('model').addContributors(contributorsToAdd, false)
                .then(this._addContributorsFromProject.bind(this));
        }
    },

    _addContributorsFromProject(contributors) {
        // Locally updates preprint contributors list
        contributors.forEach((contrib) => {
            this.get('contributors').pushObject(contrib);
        });
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
                .t(
                    `submit.error_${this.get('editMode') ? 'completing' : 'saving'}_preprint`,
                    {
                        documentType: this.get('currentProvider.documentType'),
                    },
                ));
    },

    _setAvailableLicense(licenses) {
        this.set('availableLicenses', licenses);
        this.set('basicsLicense.licenseType', this.get('availableLicenses.firstObject'));
    },

    _escapeLucene(string) {
        return string.replace(/([!*+&|()[\]{}^~?:"])/g, '\\$1');
    },

    _processQuery(query) {
        // Takes a contributor query and process it to send to the api:
        // Input: "nick cage"
        // Output: "nick*~ AND cage*~"
        // this output maps to how api v1 search users worked before (escape lucene, etc)
        return query.split(/[\s-]+/).map(p => `${this._escapeLucene(p)}*~`).join(' AND ');
    },

    _createSupplementalProject(title) {
        // Creates a project locally
        const node = this.get('store').createRecord('node', {
            public: true,
            category: 'project',
            title,
        });
        return node;
    },

    _saveSupplementalProject() {
        // Either creates a new project or uses an existing project
        // and saves that as the supplemental project on the node. The node is made public.
        const model = this.get('model');
        const pendingProject = this.get('editMode') ? this.get('selectedSupplementalProject') : this.get('node');
        const projectExists = pendingProject && pendingProject.get('id');
        const pendingTitle = this.get('editMode') ? this.get('pendingSupplementalProjectTitle') : this.get('supplementalProjectTitle');

        if (projectExists || pendingTitle) {
            const node = projectExists ? pendingProject :
                this._createSupplementalProject(pendingTitle);
            model.set('node', node);
            node.set('public', true);
            if (node.get('hasDirtyAttributes')) {
                return node.save()
                    .then(() => model.save());
            } else {
                return model.save();
            }
        }
        return model.save();
    },

    _finishUpdatingSupplementalNode() {
        // in Edit mode, locally updates the supplemental node and its title,
        // to the newly saved supplemental project - advances to next form section
        this.set('node', this.get('model.node'));
        this.set('supplementalProjectTitle', this.get('node.title'));
        this.send('changeSupplementalPickerState', this.get('_State').EDIT);
        this._moveFromSupplemental();
    },

    _errorUpdatingSupplemental() {
        // If there was an error updating the supplemental project, reset
        // the node on the model to be the original node, and the supplementalProjectTitle
        // to be that node's title
        this.get('toast').error(this.get('i18n').t('submit.error_saving_supplemental'));
        this.set('supplementalProjectTitle', this.get('node.title'));
        this.set('model.node', this.get('node'));
    },

    _successRemovingSupplementalNode() {
        // After supplemental node has been reset (Edit mode), modifies UI to reflect this
        // sends toast message, and advances to the next section
        this.set('pendingSupplementalProjectTitle', '');
        this.set('supplementalProjectTitle', '');
        this.set('selectedSupplementalProject', null);
        this.set('node', null);
        this.send('changeSupplementalPickerState', this.get('_State').START);
        this.get('toast').success(this.get('i18n').t('submit.success_saving_supplemental'));
        this._moveFromSupplemental();
    },

    _errorRemovingSupplementalNode() {
        // If there was an error removing the supplemental node, resets the UI to reflect this.
        this.set('model.node', this.get('node'));
        this.get('toast').error(this.get('i18n').t('submit.error_removing_supplemental'));
    },

    clearFields() {
        // Restores submit form defaults.
        // Called when user submits preprint, then hits back button, for example.
        this.get('panelActions').open('File');

        this.setProperties(merge(this.get('_names').reduce((acc, name) => merge(acc, { [`${name.toLowerCase()}SaveState`]: false }), {}), {
            filePickerState: State.START,
            supplementalPickerState: State.START,
            user: null,
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
            coiSaveState: false,
            supplementalSaveState: false,
            osfStorageProvider: null,
            osfProviderLoaded: false,
            titleValid: null,
            supplementalProjectTitleValid: null,
            uploadInProgress: false,
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
            submitAction: null,
        }));
    },

    // Preprint file picker state - new preprint file, or existing file that we
    // copy from project?
    filePickerState: State.START,
    supplementalPickerState: State.START,
});
