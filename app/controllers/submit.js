import Ember from 'ember';
import config from 'ember-get-config';
import Analytics from '../mixins/analytics';

import { validator, buildValidations } from 'ember-cp-validations';

import permissions from 'ember-osf/const/permissions';
import NodeActionsMixin from 'ember-osf/mixins/node-actions';
import TaggableMixin from 'ember-osf/mixins/taggable-mixin';

import loadAll from 'ember-osf/utils/load-relationship';

import fixSpecialChar from 'ember-osf/utils/fix-special-char';

// Enum of available upload states > New project or existing project?
export const State = Object.freeze(Ember.Object.create({
    START: 'start',
    NEW: 'new',
    EXISTING: 'existing'
}));

// Enum of available file states > New file or existing file?
export const existingState = Object.freeze(Ember.Object.create({
    CHOOSE: 'choose',
    EXISTINGFILE: 'existing',
    NEWFILE: 'new'
}));

// Form data and validations
const BasicsValidations = buildValidations({
    basicsAbstract: {
        description: 'Abstract',
        validators: [
            validator('presence', true),
            validator('length', {
                // currently min of 20 characters -- this is what arXiv has as the minimum length of an abstract
                min: 20,
                max: 5000
            })
        ]
    },
    basicsDOI: {
        description: 'DOI',
        validators: [
            validator('format', {
                // Simplest regex- try not to diverge too much from the backend
                regex: /\b(10\.\d{4,}(?:\.\d+)*\/\S+(?:(?!["&\'<>])\S))\b/,
                allowBlank: true,
                message: 'Please use a valid {description}'
            })
        ]
    }
});

function subjectIdMap(subjectArray) {
    // Maps array of arrays of disciplines into array of arrays of discipline ids.
    return subjectArray.map(subjectBlock => subjectBlock.map(subject => subject.id));
}

function doiRegexExec(doi) {
    //Strips url out of inputted doi, if any.  For example, user input this DOI: https://dx.doi.org/10.12345/hello. Returns 10.12345/hello.
    // If doi invalid, returns doi.
    const doiRegex = /\b(10\.\d{4,}(?:\.\d+)*\/\S+(?:(?!["&\'<>])\S))\b/;
    if (doi) {
        const doiOnly = doiRegex.exec(doi);
        return doiOnly !== null ? doiOnly[0] : doi;
    }
    return doi;

}

/**
 * @module ember-preprints
 * @submodule controllers
 */

/**
 * @class Submit Controller
 */
export default Ember.Controller.extend(Analytics, BasicsValidations, NodeActionsMixin, TaggableMixin, {
    i18n: Ember.inject.service(),
    theme: Ember.inject.service(),
    fileManager: Ember.inject.service(),
    toast: Ember.inject.service('toast'),
    panelActions: Ember.inject.service('panelActions'),
    _State: State, // Project states - new project or existing project
    filePickerState: State.START, // Selected upload state (initial decision on form) - new or existing project? (is poorly named)
    _existingState: existingState, // File states - new file or existing file
    existingState: existingState.CHOOSE, // Selected file state - new or existing file (poorly named)
    _names: ['upload', 'discipline', 'basics', 'authors', 'submit'].map(str => str.capitalize()), // Form section headers

    // Data for project picker; tracked internally on load
    user: null,
    userNodes: Ember.A(),
    userNodesLoaded: false,

    availableLicenses: Ember.A(),
    applyLicense: false,
    newNode: false,

    // Information about the thing to be turned into a preprint
    node: null, // Project or component containing the preprint
    file: null, // Preuploaded file - file that has been dragged to dropzone, but not uploaded to node.
    selectedFile: null, // File that will be the preprint (already uploaded to node or selected from existing node)
    contributors: Ember.A(), // Contributors on preprint - if creating a component, contributors will be copied over from parent
    nodeTitle: null, // Preprint title
    nodeLocked: false, // IMPORTANT PROPERTY. After advancing beyond Step 1: Upload on Add Preprint form, the node is locked.  Is True on Edit.
    searchResults: [], // List of users matching search query
    savingPreprint: false, // True when Share button is pressed on Add Preprint page
    showModalSharePreprint: false, // True when sharing preprint confirmation modal is displayed
    uploadSaveState: false, // True temporarily when changes have been saved in upload section
    disciplineSaveState: false, // True temporarily when changes have been saved in discipline section
    basicsSaveState: false, // True temporarily when changes have been saved in basics section
    authorsSaveState: false, // True temporarily when changes have been saved in authors section
    parentNode: null, // If component created, parentNode will be defined
    parentContributors: Ember.A(), // Contributors on parent project
    convertProjectConfirmed: false, // User has confirmed they want to convert their existing OSF project into a preprint,
    convertOrCopy: null, // Will either be 'convert' or 'copy' depending on whether user wants to use existing component or create a new component.
    osfStorageProvider: null, // Preprint node's osfStorage object
    osfProviderLoaded: false, // Preprint node's osfStorageProvider is loaded.
    titleValid: null,  // If node's pending title is valid.
    uploadInProgress: false, // Set to true when upload step is underway,
    existingPreprints: Ember.A(), // Existing preprints on the current node
    abandonedPreprint: null, // Abandoned(draft) preprint on the current node
    editMode: false, // Edit mode is false by default.
    shareButtonDisabled: false, // Relevant in Add mode - flag prevents users from sending multiple requests to server

    isTopLevelNode: Ember.computed('node', function() {
        // Returns true if node is a top-level node
        let node = this.get('node');
        if (node) {
            return node.get('parent.id') ? false : true;
        }
        return null;
    }),

    hasFile: Ember.computed('file', 'selectedFile', function() {
        // True if file has either been preuploaded, or already uploaded file has been selected.
        return this.get('file') !== null || this.get('selectedFile') !== null;
    }),

    clearFields() {
        // Restores submit form defaults.  Called when user submits preprint, then hits back button, for example.
        this.get('panelActions').open('Upload');
        this.get('panelActions').close('Submit');

        this.setProperties(Ember.merge(
            this.get('_names').reduce((acc, name) => Ember.merge(acc, {[`${name.toLowerCase()}SaveState`]: false}), {}), {
            filePickerState: State.START,
            existingState: existingState.CHOOSE,
            user: null,
            userNodes: Ember.A(),
            userNodesLoaded: false,
            node: null,
            file: null,
            selectedFile: null,
            contributors: Ember.A(),
            nodeTitle: null,
            nodeLocked: false, // Will be set to true if edit?
            searchResults: [],
            savingPreprint: false,
            showModalSharePreprint: false,
            uploadSaveState: false,
            disciplineSaveState: false,
            basicsSaveState: false,
            authorsSaveState: false,
            parentNode: null,
            parentContributors: Ember.A(),
            convertProjectConfirmed: false,
            convertOrCopy: null,
            osfStorageProvider: null,
            titleValid: null,
            uploadInProgress: false,
            existingPreprints: Ember.A(),
            abandonedPreprint: null,
            editMode: false,
            shareButtonDisabled: false,
            // Basics and subjects fields need to be reset because the Add process overwrites the computed properties as reg properties
            basicsTags: Ember.A(),
            basicsAbstract: null,
            basicsDOI: null,
            basicsLicense: null,
            subjectsList: Ember.A(),
            availableLicenses: Ember.A(),
            applyLicense: false,
            newNode: false
        }));
    },

    ///////////////////////////////////////
    // Validation rules and changed states for form sections

    // In order to advance from upload state, node and selectedFile must have been defined, and nodeTitle must be set.
    uploadValid: Ember.computed.alias('nodeLocked'), // Once the node has been locked (happens in step one of upload section), users are free to navigate through form unrestricted
    abstractValid: Ember.computed.alias('validations.attrs.basicsAbstract.isValid'),
    doiValid: Ember.computed.alias('validations.attrs.basicsDOI.isValid'),
    // Must have year and copyrightHolders filled if those are required by the licenseType selected
    licenseValid: false,
    // Basics fields that are being validated are abstract, license and doi (title validated in upload section). If validation added for other fields, expand basicsValid definition.
    basicsValid: Ember.computed.and('abstractValid', 'doiValid', 'licenseValid'),
    // Must have at least one contributor. Backend enforces admin and bibliographic rules. If this form section is ever invalid, something has gone horribly wrong.
    authorsValid: Ember.computed.bool('contributors.length'),
    // Does node have a saved title?
    savedTitle: Ember.computed('node.title', function() {
        return !!this.get('node.title');
    }),
    // Does preprint have a saved primaryFile?
    savedFile: Ember.computed('model.primaryFile', function() {
        return !!this.get('model.primaryFile.content');
    }),
    // Does node have a saved description?
    savedAbstract: Ember.computed('node.description', function() {
        return !!this.get('node.description');
    }),
    // Does preprint have saved subjects?
    savedSubjects: Ember.computed('model.subjects.@each', function() {
        return this.get('model.subjects').length !== 0;
    }),
    // Preprint can be published once all required sections have been saved.
    allSectionsValid: Ember.computed('savedTitle', 'savedFile', 'savedAbstract', 'savedSubjects', 'authorsValid', function() {
        return this.get('savedTitle') && this.get('savedFile') && this.get('savedAbstract') && this.get('savedSubjects') && this.get('authorsValid');
    }),
    ////////////////////////////////////////////////////
    // Fields used in the "upload" section of the form.
    ////////////////////////////////////////////////////
    preprintFileChanged: Ember.computed('model.primaryFile', 'selectedFile', 'file', function() {
        // Does the pending primaryFile differ from the primary file already saved?
        return this.get('model.primaryFile.id') !== this.get('selectedFile.id') || this.get('file') !== null;
    }),
    titleChanged: Ember.computed('node.title', 'nodeTitle', function() {
        // Does the pending title differ from the title already saved?
        return this.get('node.title') !== this.get('nodeTitle');
    }),
    uploadChanged: Ember.computed('preprintFileChanged', 'titleChanged', function() {
        // Are there any unsaved changes in the upload section?
        return this.get('preprintFileChanged') || this.get('titleChanged');
    }),
    ////////////////////////////////////////////////////
    // Fields used in the "basics" section of the form.
    ////////////////////////////////////////////////////
    basicsAbstract:  Ember.computed('node.description', function() {
        // Pending abstract
        let node = this.get('node');
        return node ? node.get('description') : null;
    }),
    abstractChanged: Ember.computed('basicsAbstract', 'node.description', function() {
        // Does the pending abstract differ from the saved abstract in the db?
        let basicsAbstract = this.get('basicsAbstract');
        return basicsAbstract !== null && basicsAbstract.trim() !== this.get('node.description');
    }),
    basicsTags: Ember.computed('node', function() {
        // Pending tags
        let node = this.get('node');
        let newTags = null;
        if (node != null) {
            newTags = node.get('tags').slice(0).map(fixSpecialChar);
        }
        return node ? newTags : Ember.A();
    }),
    tagsChanged: Ember.computed('basicsTags', 'node.tags', function() {
        // Does the list of pending tags differ from the saved tags in the db?
        let basicsTags = this.get('basicsTags');
        let nodeTags = this.get('node.tags');
        let changed = false;
        if (basicsTags && nodeTags) {
            changed = !(basicsTags.length === nodeTags.length && basicsTags.every((v, i)=> fixSpecialChar(v) === fixSpecialChar(nodeTags[i])));
        }
        return changed;
    }),
    basicsDOI: Ember.computed('model', function() {
        // Pending DOI
        return this.get('model.doi');
    }),
    doiChanged: Ember.computed('model.doi', 'basicsDOI', function() {
        // Does the pending DOI differ from the saved DOI in the db?
        // If pending DOI and saved DOI are both falsy values, doi has not changed.
        const basicsDOI = doiRegexExec(this.get('basicsDOI'));
        const modelDOI = this.get('model.doi');
        return (basicsDOI || modelDOI) && basicsDOI !== modelDOI;
    }),
    basicsLicense: Ember.computed('model', function() {
        // This loads up the current license information if the preprint has one, otherwise initializes the
        // license object with null values
        let record = this.get('model.licenseRecord');
        let license = this.get('model.license');
        return {
            year: record ? record.year : null,
            copyrightHolders: record && record.copyright_holders ? record.copyright_holders.join(',') : null,
            licenseType: license || null
        };
    }),
    licenseChanged: Ember.computed('model.license', 'model.licenseRecord', 'basicsLicense.year', 'basicsLicense.copyrightHolders', 'basicsLicense.licenseType', function() {
        let changed = false;
        if (this.get('model.licenseRecord') || this.get('model.license.content')) {
            changed = changed || (this.get('model.license.name') !== this.get('basicsLicense.licenseType.name'));
            changed = changed || (this.get('model.licenseRecord').year !== this.get('basicsLicense.year'));
            changed = changed || ((this.get('model.licenseRecord.copyright_holders.length') ? this.get('model.licenseRecord.copyright_holders').join(',') : '') !== this.get('basicsLicense.copyrightHolders'));
        } else {
            changed = changed || ((this.get('availableLicenses').toArray().length ? this.get('availableLicenses').toArray()[0].get('name') : null) !== this.get('basicsLicense.licenseType.name'));
            let date = new Date();
            changed = changed || (date.getUTCFullYear().toString() !== this.get('basicsLicense.year'));
            changed = changed || !(this.get('basicsLicense.copyrightHolders') === '' || !this.get('basicsLicense.copyrightHolders.length') || this.get('basicsLicense.copyrightHolders') === null);
        }
        return changed;
    }),
    basicsChanged: Ember.computed('tagsChanged', 'abstractChanged', 'doiChanged', 'licenseChanged', function() {
        // Are there any unsaved changes in the basics section?
        return this.get('tagsChanged') || this.get('abstractChanged') || this.get('doiChanged') || this.get('licenseChanged');
    }),
    ////////////////////////////////////////////////////
    // Fields used in the "discipline" section of the form.
    ////////////////////////////////////////////////////
    subjectsList: Ember.computed('model.subjects.@each', function() {
        // Pending subjects
        return this.get('model.subjects') ? Ember.$.extend(true, [], this.get('model.subjects')) : Ember.A();
    }),
    disciplineReduced: Ember.computed('model.subjects', function() {
        // Flattened subject list
        return Ember.$.extend(true, [], this.get('model.subjects')).reduce((acc, val) => acc.concat(val), []).uniqBy('id');
    }),

    getContributors: Ember.observer('node', function() {
        // Returns all contributors of node that will be container for preprint.  Makes sequential requests to API until all pages of contributors have been loaded
        // and combines into one array

        // Cannot be called until a project has been selected!
        if (!this.get('node')) return;

        let node = this.get('node');
        let contributors = Ember.A();
        loadAll(node, 'contributors', contributors).then(()=>
             this.set('contributors', contributors));
    }),

    getNodePreprints: Ember.observer('node', function() {
        // Returns any existing preprints stored on the current node

        // Cannot be called until a project has been selected!
        const node = this.get('node');
        if (!node) return;

        node.get('preprints').then((preprints) => {
            this.set('existingPreprints', preprints);
            if (preprints.toArray().length > 0) { // If node already has a preprint
                let preprint = preprints.toArray()[0]; // TODO once branded is finished, this will change
                if (!(preprint.get('isPublished'))) { // Preprint exists in abandoned state.
                    this.set('abandonedPreprint', preprint);
                }
            }
        });
    }),

    getParentContributors: Ember.observer('parentNode', function() {
        // Returns all contributors of parentNode if component was created.  User later has option to import
        // parentContributors to component.
        let parent = this.get('parentNode');
        let contributors = Ember.A();
        loadAll(parent, 'contributors', contributors).then(()=>
             this.set('parentContributors', contributors));
    }),

    isAdmin: Ember.computed('node', function() {
        // True if the current user has admin permissions
        return (this.get('node.currentUserPermissions') || []).includes(permissions.ADMIN);
    }),

    canEdit: Ember.computed('isAdmin', 'node', function() {
        // True if the current user is and admin and the node is not a registration.
        return this.get('isAdmin') && !(this.get('node.registration'));
    }),

    actions: {
        editLicense(license, validates) {
            // This gets called by the save method of the license-widget, which in autosave mode
            // gets called everytime a change is observed in the widget.
            this.set('basicsLicense', license);
            this.set('licenseValid', validates);
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'dropdown',
                    action: 'select',
                    label: `Preprints - ${this.get('editMode') ? 'Edit' : 'Submit'} - Edit License`
                });
        },
        applyLicenseToggle(apply) {
            this.set('applyLicense', apply);
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'radio-button',
                    action: 'select',
                    label: `Preprints - ${this.get('editMode') ? 'Edit' : 'Submit'} - Apply License: ${apply}`
                });
        },
        next(currentPanelName) {
            // Open next panel
            if (currentPanelName === 'Upload' || currentPanelName === 'Basics') {
                Ember.run.scheduleOnce('afterRender', this, function() {
                    MathJax.Hub.Queue(['Typeset', MathJax.Hub, Ember.$(currentPanelName === 'Upload' ? '.preprint-header-preview' : '.abstract')[0]]);  // jshint ignore:line
                });
            }
            if (currentPanelName === 'Authors') {
                Ember.get(this, 'metrics')
                    .trackEvent({
                        category: 'button',
                        action: 'click',
                        label: `Preprints - ${this.get('editMode') ? 'Edit' : 'Submit'} - Authors Next Button`
                    });
            }
            this.get('panelActions').open(this.get(`_names.${this.get('_names').indexOf(currentPanelName) + 1}`));
            this.send('changesSaved', currentPanelName);
        },
        nextUploadSection(currentUploadPanel, nextUploadPanel) {
            // Opens next panel within the Upload Section, Existing Workflow (Choose Project - Choose File - Organize - Finalize Upload)
            this.get('panelActions').toggle(currentUploadPanel);
            this.get('panelActions').toggle(nextUploadPanel);
        },
        changesSaved(currentPanelName) {
            // Temporarily changes panel save state to true.  Used for flashing 'Changes Saved' in UI.
            let currentPanelSaveState = currentPanelName.toLowerCase() + 'SaveState';
            this.set(currentPanelSaveState, true);
            setTimeout(() => {
                this.set(currentPanelSaveState, false);

            }, 3000);
        },

        error(error /*, transition */) {
            this.get('toast').error(error);
        },
        /*
          Upload section
         */
        changeInitialState(newState) {
            // Sets filePickerState to start, new, or existing - this is the initial decision on the form.
            this.set('filePickerState', newState);
            this.send('clearDownstreamFields', 'allUpload');
            if (newState === this.get('_State').NEW) {
                Ember.get(this, 'metrics')
                    .trackEvent({
                        category: 'button',
                        action: 'click',
                        label: 'Preprints - Submit - Upload new preprint'
                    });
            } else if (newState === this.get('_State').EXISTING) {
                this.get('panelActions').open('chooseProject');
                this.get('panelActions').close('selectExistingFile');
                this.get('panelActions').close('uploadNewFile');
                this.get('panelActions').close('organize');
                this.get('panelActions').close('finalizeUpload');
                Ember.get(this, 'metrics')
                    .trackEvent({
                        category: 'button',
                        action: 'click',
                        label: 'Preprints - Submit - Connect preprint to existing OSF Project'
                    });
            } else {
                Ember.get(this, 'metrics')
                    .trackEvent({
                        category: 'button',
                        action: 'click',
                        label: 'Preprints - Submit - Back Button, Upload Section'
                    });
            }
        },
        lockNode() {
            // Locks node so that preprint location cannot be modified.  Occurs after upload step is complete.
            // In editMode, nodeLocked is set to true.
            this.set('nodeLocked', true);
        },
        finishUpload() {
            // Locks node and advances to next form section.
            this.send('lockNode');
            this.set('file', null);
            // Closes section, so all panels closed if Upload section revisited
            this.get('panelActions').close('uploadNewFile');
            this.send('next', this.get('_names.0'));
        },
        existingNodeExistingFile() {
            // Upload case for using existing node and existing file for the preprint.  If title has been edited, updates title.
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Preprints - Submit - Save and Continue, Existing Node Existing File'
                });
            let node = this.get('node');
            this.set('basicsAbstract', this.get('node.description') || null);

            if (node.get('title') !== this.get('nodeTitle')) {
                let currentTitle = node.get('title');
                node.set('title', this.get('nodeTitle'));
                node.save()
                    .then(() => this.get('abandonedPreprint') ? this.send('resumeAbandonedPreprint') : this.send('startPreprint'))
                    .catch(() => {
                        node.set('title', currentTitle);
                        this.get('toast').error(this.get('i18n').t('submit.could_not_update_title'));
                    });

            } else {
                return this.get('abandonedPreprint') ? this.send('resumeAbandonedPreprint') : this.send('startPreprint');
            }
        },
        createComponentCopyFile() {
            // Upload case for using a new component and an existing file for the preprint. Creates a component and then copies
            // file from parent node to new component.
            let node = this.get('node');
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Preprints - Submit - Save and Continue, New Component, Copy File'
                });
            node.addChild(this.get('nodeTitle'))
                .then(child => {
                    this.set('parentNode', node);
                    this.set('node', child);
                    this.set('basicsAbstract', this.get('node.description') || null);
                    child.get('files')
                        .then((providers) => {
                            let osfstorage = providers.findBy('name', 'osfstorage');
                            this.get('fileManager').copy(this.get('selectedFile'), osfstorage, {data: {resource: child.id}})
                                .then((copiedFile) => {
                                    this.set('selectedFile', copiedFile);
                                    this.send('startPreprint', this.get('parentNode'));
                                    this.set('applyLicense', true);
                                    this.set('newNode', true);
                                })
                                .catch(() => this.get('toast').error(this.get('i18n').t('submit.error_copying_file')));
                        })
                        .catch(() => {
                            this.get('toast').error(this.get('i18n').t('submit.error_accessing_parent_files'));
                        });
                })
                .catch(() => {
                    this.get('toast').error(this.get('i18n').t('submit.could_not_create_component'));
                });

        },
        resumeAbandonedPreprint() {
            // You can only have one preprint per provider. For now, we delete the abandoned preprint so another preprint can be created.
            let preprintRecord = this.store.peekRecord('preprint', this.get('abandonedPreprint').id);
            preprintRecord.destroyRecord()
                .then(() => {
                    this.send('startPreprint');
                })
                .catch(() => {
                    this.get('toast').error(this.get('i18n').t('submit.abandoned_preprint_error'));
                });
        },
        startPreprint(parentNode) {
            // Initiates preprint.  Occurs in Upload section of Add Preprint form when pressing 'Save and continue'.  Creates a preprint with
            // primaryFile, node, and provider fields populated.
            let model = this.get('model');
            this.get('node.license').then(license => {
                //This is used to set the default applyLicense once a node is loaded, as if the node's
                //license is not set or is of type No license, we want to set the default to make its license the same
                //as the preprint license.
                if (license === null || license && license.get('name').includes('No license')) {
                    this.set('applyLicense', true);
                }
            });
            const provider = this.get('store')
                .peekRecord('preprint-provider', this.get('theme.id') || config.PREPRINTS.provider);

            model.set('primaryFile', this.get('selectedFile'));
            model.set('node', this.get('node'));
            model.set('provider', provider);

            return model.save()
                .then(() => {
                    this.set('filePickerState', State.EXISTING); // Sets upload form state to existing project (now that project has been created)
                    this.set('existingState', existingState.NEWFILE); // Sets file state to new file, for edit mode.
                    this.set('file', null);
                    this.get('toast').info(this.get('i18n').t('submit.preprint_file_uploaded'));
                    this.send('finishUpload');
                })
                .catch(() => {
                    this.set('uploadInProgress', false); // Setting to false allows user to attempt operation again.
                    if (parentNode) { // If creating preprint failed after a component was created, set the node back to the parentNode.
                        // If user tries to initiate preprint again, a separate component will be created under the parentNode.
                        this.set('node', parentNode);
                    }
                    this.get('toast').error(this.get('i18n').t('submit.error_initiating_preprint'));
                });
        },
        selectExistingFile(file) {
            // Takes file chosen from file-browser and sets equal to selectedFile. This file will become the preprint.
            this.set('selectedFile', file);
        },
        discardUploadChanges() {
            // Discards upload section changes.  Restores displayed file to current preprint primaryFile
            // and resets displayed title to current node title. (No requests sent, front-end only.)
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `Preprints - ${this.get('editMode') ? 'Edit' : 'Submit'} - Discard Upload Changes`
                });
            let currentFile = this.get('store').peekRecord('file', this.get('model.primaryFile.id'));
            this.set('file', null);
            this.set('selectedFile', currentFile);

            this.set('nodeTitle', this.get('node.title'));
            this.set('titleValid', true);

        },
        clearDownstreamFields(section) {
            //If user goes back and changes a section inside Upload, all fields downstream of that section need to clear.
            if (!this.get('nodeLocked')) { // Only clear downstream fields in Add mode!
                switch (section) {
                    case 'allUpload':
                        this.set('node', null);
                        this.set('selectedFile', null);
                        this.set('file', null);
                        this.set('convertOrCopy', null);
                        this.set('nodeTitle', null);
                        break;
                    case 'belowNode':
                        this.set('selectedFile', null);
                        this.set('file', null);
                        this.set('convertOrCopy', null);
                        this.set('nodeTitle', null);
                        break;
                    case 'belowFile': {
                        this.set('convertOrCopy', null);
                        this.set('nodeTitle', null);
                        break;
                    }
                    case 'belowConvertOrCopy': {
                        this.set('nodeTitle', null);
                        break;
                    }
                }
            }
        },
        /*
          Basics section
         */
        discardBasics() {
            // Discards changes to basic fields. (No requests sent, front-end only.)
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `Preprints - ${this.get('editMode') ? 'Edit' : 'Submit'} - Discard Basics Changes`
                });
            this.set('basicsTags', this.get('node.tags').slice(0).map(fixSpecialChar));
            this.set('basicsAbstract', this.get('node.description'));
            this.set('basicsDOI', this.get('model.doi'));
            let date = new Date();
            this.get('model.license').then(license => {
                this.set('basicsLicense', {
                    licenseType: license || this.get('availableLicenses').toArray()[0],
                    year: this.get('model.licenseRecord') ? this.get('model.licenseRecord').year : date.getUTCFullYear().toString(),
                    copyrightHolders: this.get('model.licenseRecord') ? this.get('model.licenseRecord').copyright_holders.join(',') : ''
                });
            });
        },
        preventDefault(e) {
            e.preventDefault();
        },
        stripDOI() {
            // Replaces the inputted doi link with just the doi itself
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'input',
                    action: 'onchange',
                    label: `Preprints - ${this.get('editMode') ? 'Edit' : 'Submit'} - DOI Text Change`
                });
            let basicsDOI = this.get('basicsDOI');
            this.set('basicsDOI', doiRegexExec(basicsDOI));
        },
        saveBasics() {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `Preprints - ${this.get('editMode') ? 'Edit' : 'Submit'} - Save and Continue Basics Section`
                });
            // Saves the description/tags on the node and the DOI on the preprint, then advances to next panel
            if (!this.get('basicsValid')) {
                return;
            }
            let node = this.get('node');
            let model = this.get('model');
            // Saves off current server-state basics fields, so UI can be restored in case of failure
            let currentAbstract = node.get('description');
            let currentTags = node.get('tags').slice(0);
            let currentDOI = model.get('doi');
            let currentLicenseType = model.get('license');
            let currentLicenseRecord = model.get('licenseRecord');
            let currentNodeLicenseType = node.get('license');
            let currentNodeLicenseRecord = node.get('nodeLicense');

            let newCopyrightHolders = [];
            if (this.get('basicsLicense.copyrightHolders') && this.get('basicsLicense.copyrightHolders').length) {
                newCopyrightHolders = this.get('basicsLicense.copyrightHolders').slice().split(',');
            }

            if (this.get('abstractChanged')) node.set('description', this.get('basicsAbstract'));
            if (this.get('tagsChanged')) node.set('tags', this.get('basicsTags'));

            if (this.get('applyLicense')) {
                if (node.get('nodeLicense.year') !== this.get('basicsLicense.year') || node.get('nodeLicense.copyrightHolders') !== newCopyrightHolders) {
                    node.set('nodeLicense', {year: this.get('basicsLicense.year'), copyright_holders: newCopyrightHolders});
                }
                if (node.get('license.name') !== this.get('basicsLicense.licenseType.name')) {
                    node.set('license', this.get('basicsLicense.licenseType'));
                }
            }

            node.save()
                .then(() => {
                    if (this.get('doiChanged')) {
                        model.set('doi', this.get('basicsDOI') || null);
                        if (this.get('licenseChanged') || !this.get('model.license.name')) {
                            model.set('licenseRecord', {year: this.get('basicsLicense.year'), copyright_holders: newCopyrightHolders});
                            model.set('license', this.get('basicsLicense.licenseType'));
                        }
                        model.save()
                            .then(() => {
                                this.send('next', this.get('_names.2'));
                            })
                            .catch(() => {
                                model.set('licenseRecord', currentLicenseRecord);
                                model.set('license', currentLicenseType);
                                model.set('doi', currentDOI);
                                this.get('toast').error(this.get('i18n').t('submit.doi_error'));
                            });
                    } else if (this.get('licenseChanged') || !this.get('model.license.name')) {
                        model.set('licenseRecord', {year: this.get('basicsLicense.year'), copyright_holders: newCopyrightHolders});
                        model.set('license', this.get('basicsLicense.licenseType'));
                        model.save()
                            .then(() => {
                                this.send('next', this.get('_names.2'));
                            })
                            .catch(() => {
                                model.set('licenseRecord', currentLicenseRecord);
                                model.set('license', currentLicenseType);
                            });
                    } else {
                        this.send('next', this.get('_names.2'));
                    }

                })
                // If save fails, do not transition
                .catch(() => {
                    node.set('description', currentAbstract);
                    node.set('tags', currentTags);
                    model.set('doi', currentDOI);
                    node.set('license', currentNodeLicenseType);
                    node.set('nodeLicense', currentNodeLicenseRecord);
                    this.get('toast').error(this.get('i18n').t('submit.basics_error'));

                });
        },

        addTag(tag) {
            // Custom addATag method that appends tag to list instead of auto-saving
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'input',
                    action: 'onchange',
                    label: `Preprints - ${this.get('editMode') ? 'Edit' : 'Submit'} - Add Tag`
                });
            let tags = this.get('basicsTags').slice(0);
            Ember.A(tags);

            tags.pushObject(tag);
            this.set('basicsTags', tags);
            return tags;
        },

        removeTag(tag) {
            // Custom removeATag method that removes tag from list instead of auto-saving
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `Preprints - ${this.get('editMode') ? 'Edit' : 'Submit'} - Remove Tag`
                });
            let tags = this.get('basicsTags').slice(0);
            tags.splice(tags.indexOf(tag), 1);
            this.set('basicsTags', tags);
            return tags;

        },

        /*
          Discipline section
        */

        // Saves subjects (disciplines) and then moves to next section.
        saveSubjects(hasChanged) {
            const sendNext = () => this.send('next', this.get('_names.1'));

            if (!hasChanged) {
                return sendNext();
            }

            const model = this.get('model');

            model.set('subjects', subjectIdMap(this.get('subjectsList')));
            model.save()
                .then(sendNext)
                .catch(() => {
                    // Current subjects saved so UI can be restored in case of failure
                    model.set('subjects', Ember.$.extend(true, [], this.get('model.subjects')));
                    this.get('toast').error(this.get('i18n').t('submit.disciplines_error'));
                });
        },
        /**
         * findContributors method.  Queries APIv2 users endpoint on any of a set of name fields.  Fetches specified page of results.
         *
         * @method findContributors
         * @param {String} query ID of user that will be a contributor on the node
         * @param {Integer} page Page number of results requested
         * @return {User[]} Returns specified page of user records matching query
         */
        findContributors(query, page) {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `Preprints - ${this.get('editMode') ? 'Edit' : 'Submit'} - Search for Authors`
                });
            return this.store.query('user', {
                filter: {
                    'full_name,given_name,middle_names,family_name': query
                },
                page: page
            }).then((contributors) => {
                this.set('searchResults', contributors);
                return contributors;
            }).catch(() => {
                this.get('toast').error(this.get('i18n').t('submit.search_contributors_error'));
                this.highlightSuccessOrFailure('author-search-box', this, 'error');
            });
        },
        /**
        * highlightSuccessOrFailure method. Element with specified ID flashes green or red depending on response success.
        *
        * @method highlightSuccessOrFailure
        * @param {string} elementId Element ID to change color
        * @param {Object} context "this" scope
        * @param {string} status "success" or "error"
        */
        highlightSuccessOrFailure(elementId, context, status) {
            Ember.run.next(Ember.Object.create({ elementId, context }), function() {
                const highlightClass = `${status === 'success' ? 'success' : 'error'}Highlight`;

                this.context.$('#' + this.elementId).addClass(highlightClass);

                setTimeout(() => this.context.$('#' + this.elementId).removeClass(highlightClass), 2000);
            });
        },
        /*
          Submit tab actions
         */
        toggleSharePreprintModal() {
            // Toggles display of share preprint modal
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Preprints - Submit - Open Share Preprint Modal'
                });
            this.toggleProperty('showModalSharePreprint');
        },
        savePreprint() {
            // Finalizes saving of preprint.  Publishes preprint and turns node public.
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `Preprints - ${this.get('editMode') ? 'Edit - Complete Preprint Edits' : 'Submit - Share Preprint'}`
                });

            const model = this.get('model');
            const node = this.get('node');
            this.set('savingPreprint', true);
            this.toggleProperty('shareButtonDisabled');
            model.set('isPublished', true);
            node.set('public', true);

            return model.save()
                .then(() => node.save())
                .then(() => {
                    if (this.get('editMode')) {
                        window.location = window.location.pathname; //TODO Ember way to do this?  In edit mode, already in content route.
                    } else {
                        this.transitionToRoute(
                            `${this.get('theme.isProvider') ? 'provider.' : ''}content`,
                            model
                        );
                    }
                })
                .catch(() => {
                    this.toggleProperty('shareButtonDisabled');
                    return this.get('toast')
                        .error(this.get('i18n')
                            .t(`submit.error_${this.get('editMode') ? 'completing' : 'saving'}_preprint`)
                        );
                });
        },
    }
});
