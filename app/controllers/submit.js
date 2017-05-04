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

// Helper function to determine if discipline has changed (comparing list of lists)
function disciplineArraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; ++i) {
        if (a[i].length !== b[i].length) return false;
        for (let j = 0; j < a[i].length; ++j) {
            if (a[i][j] !== b[i][j]) return false;
        }
    }
    return true;
}

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
    disciplineModifiedToggle: false, // Helps determine if discipline has changed
    uploadInProgress: false, // Set to true when upload step is underway,
    existingPreprints: Ember.A(), // Existing preprints on the current node
    abandonedPreprint: null, // Abandoned(draft) preprint on the current node
    editMode: false, // Edit mode is false by default.
    shareButtonDisabled: false, // Relevant in Add mode - flag prevents users from sending multiple requests to server

    isTopLevelNode: Ember.computed.not('node.parent.id'),

    hasFile: Ember.computed.or('file', 'selectedFile'),

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
            disciplineModifiedToggle: false,
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

    // Must select at least one subject (looking at pending subjects)
    disciplineValid: Ember.computed.notEmpty('subjectsList'),

    // Does node have a saved title?
    savedTitle: Ember.computed.notEmpty('node.title'),

    // Does preprint have a saved primaryFile?
    savedFile: Ember.computed.notEmpty('model.primaryFile.content'),

    // Does node have a saved description?
    savedAbstract: Ember.computed.notEmpty('node.description'),

    // Does preprint have saved subjects?
    savedSubjects: Ember.computed.notEmpty('model.subjects'),

    // Preprint can be published once all required sections have been saved.
    allSectionsValid: Ember.computed.and('savedTitle', 'savedFile', 'savedAbstract', 'savedSubjects', 'authorsValid'),

    ////////////////////////////////////////////////////
    // Fields used in the "upload" section of the form.
    ////////////////////////////////////////////////////

    // Does the pending primaryFile differ from the primary file already saved?
    preprintFileChanged: Ember.computed('model.primaryFile', 'selectedFile', 'file', function() {
        return this.get('model.primaryFile.id') !== this.get('selectedFile.id') || this.get('file') !== null;
    }),

    // Does the pending title differ from the title already saved?
    titleChanged: Ember.computed('node.title', 'nodeTitle', function() {
        return this.get('node.title') !== this.get('nodeTitle');
    }),

    // Are there any unsaved changes in the upload section?
    uploadChanged: Ember.computed.or('preprintFileChanged', 'titleChanged'),

    ////////////////////////////////////////////////////
    // Fields used in the "basics" section of the form.
    ////////////////////////////////////////////////////

    // Pending abstract
    basicsAbstract:  Ember.computed('node.description', function() {
        let node = this.get('node');
        return node ? node.get('description') : null;
    }),

    // Does the pending abstract differ from the saved abstract in the db?
    abstractChanged: Ember.computed('basicsAbstract', 'node.description', function() {
        let basicsAbstract = this.get('basicsAbstract');
        return basicsAbstract !== null && basicsAbstract.trim() !== this.get('node.description');
    }),

    // Pending tags
    basicsTags: Ember.computed('node', function() {
        const node = this.get('node');

        return node ? node.get('tags').map(fixSpecialChar) : Ember.A();
    }),

    // Does the list of pending tags differ from the saved tags in the db?
    tagsChanged: Ember.computed('basicsTags.@each', 'node.tags', function() {
        const basicsTags = this.get('basicsTags');
        const nodeTags = this.get('node.tags');

        return basicsTags && nodeTags &&
            (
                basicsTags.length !== nodeTags.length ||
                basicsTags.some(
                    (v, i) => fixSpecialChar(v) !== fixSpecialChar(nodeTags[i])
                )
            );
    }),

    basicsDOI: Ember.computed.or('model.doi'),

    doiChanged: Ember.computed('model.doi', 'basicsDOI', function() {
        // Does the pending DOI differ from the saved DOI in the db?
        // If pending DOI and saved DOI are both falsy values, doi has not changed.
        const basicsDOI = doiRegexExec(this.get('basicsDOI'));
        const modelDOI = this.get('model.doi');
        return (basicsDOI || modelDOI) && basicsDOI !== modelDOI;
    }),

    // This loads up the current license information if the preprint has one, otherwise initializes the
    // license object with null values
    basicsLicense: Ember.computed('model', function() {
        let record = this.get('model.licenseRecord');
        let license = this.get('model.license');
        return {
            year: record ? record.year : null,
            copyrightHolders: record && record.copyright_holders ? record.copyright_holders.join(', ') : '',
            licenseType: license || null
        };
    }),

    licenseChanged: Ember.computed('model.license', 'model.licenseRecord', 'basicsLicense.year', 'basicsLicense.copyrightHolders', 'basicsLicense.licenseType', function() {
        let changed = false;
        if (this.get('model.licenseRecord') || this.get('model.license.content')) {
            changed |= (this.get('model.license.name') !== this.get('basicsLicense.licenseType.name'));
            changed |= (this.get('model.licenseRecord').year !== this.get('basicsLicense.year'));
            changed |= ((this.get('model.licenseRecord.copyright_holders.length') ? this.get('model.licenseRecord.copyright_holders').join(', ') : '') !== this.get('basicsLicense.copyrightHolders'));
        } else {
            changed |= ((this.get('availableLicenses').toArray().length ? this.get('availableLicenses').toArray()[0].get('name') : null) !== this.get('basicsLicense.licenseType.name'));
            changed |= ((new Date()).getUTCFullYear().toString() !== this.get('basicsLicense.year'));
            changed |= !(this.get('basicsLicense.copyrightHolders') === '' || !this.get('basicsLicense.copyrightHolders.length') || this.get('basicsLicense.copyrightHolders') === null);
        }

        return changed;
    }),

    // Are there any unsaved changes in the basics section?
    basicsChanged: Ember.computed.or('tagsChanged', 'abstractChanged', 'doiChanged', 'licenseChanged'),

    ////////////////////////////////////////////////////
    // Fields used in the "discipline" section of the form.
    ////////////////////////////////////////////////////

    // Pending subjects
    subjectsList: Ember.computed('model.subjects.@each', function() {
        return this.get('model.subjects') ? Ember.$.extend(true, [], this.get('model.subjects')) : Ember.A();
    }),

    // Flattened subject list
    disciplineReduced: Ember.computed('model.subjects', function() {
        return Ember.$.extend(true, [], this.get('model.subjects')).reduce((acc, val) => acc.concat(val), []).uniqBy('id');
    }),

    // Are there any unsaved changes in the discipline section?
    disciplineChanged: Ember.computed('model.subjects.@each.subject', 'subjectsList.@each.subject', 'disciplineModifiedToggle',  function() {
        return !(disciplineArraysEqual(subjectIdMap(this.get('model.subjects')), subjectIdMap(this.get('subjectsList'))));
    }),

    // Returns all contributors of node that will be container for preprint.  Makes sequential requests to API until all pages of contributors have been loaded
    // and combines into one array
    getContributors: Ember.observer('node', function() {
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

    // True if the current user has admin permissions
    isAdmin: Ember.computed('node', function() {
        return (this.get('node.currentUserPermissions') || []).includes(permissions.ADMIN);
    }),

    // True if the current user is and admin and the node is not a registration.
    canEdit: Ember.computed('isAdmin', 'node', function() {
        return this.get('isAdmin') && !(this.get('node.registration'));
    }),

    actions: {
        // This gets called by the save method of the license-widget, which in autosave mode
        // gets called every time a change is observed in the widget.
        editLicense(basicsLicense, licenseValid) {
            this.setProperties({
                basicsLicense,
                licenseValid
            });

            if (this.get('initialLicenseChangeMade') || this.get('editMode')) {
                Ember.get(this, 'metrics')
                    .trackEvent({
                        category: 'dropdown',
                        action: 'select',
                        label: `Preprints - ${this.get('editMode') ? 'Edit' : 'Submit'} - Edit License`
                    });
            }
            this.set('initialLicenseChangeMade', true);
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
            Ember.run.later(this, () => {
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
        finishUpload() {
            // Locks node so that preprint location cannot be modified.  Occurs after upload step is complete.
            // In editMode, nodeLocked is set to true.
            // Locks node and advances to next form section.
            this.setProperties({
                nodeLocked: true,
                file: null
            });
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

            const node = this.get('node');
            const currentTitle = node.get('title');
            const nodeTitle = this.get('nodeTitle');

            this.set('basicsAbstract', this.get('node.description') || null);

            return Promise.resolve()
                .then(() => {
                    if (currentTitle === nodeTitle) {
                        return;
                    }

                    node.set('title', nodeTitle);
                    return node.save();
                })
                .then(() => this.send(this.get('abandonedPreprint') ? 'resumeAbandonedPreprint' : 'startPreprint'))
                .catch(() => {
                    node.set('title', currentTitle);
                    this.get('toast').error(
                        this.get('i18n').t('submit.could_not_update_title')
                    );
                });
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

        // Takes file chosen from file-browser and sets equal to selectedFile. This file will become the preprint.
        selectExistingFile(file) {
            this.set('selectedFile', file);
        },

        // Discards upload section changes.  Restores displayed file to current preprint primaryFile
        // and resets displayed title to current node title. (No requests sent, front-end only.)
        discardUploadChanges() {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `Preprints - ${this.get('editMode') ? 'Edit' : 'Submit'} - Discard Upload Changes`
                });

            this.setProperties({
                file: null,
                selectedFile: this.get('store').peekRecord('file', this.get('model.primaryFile.id')),
                nodeTitle: this.get('node.title'),
                titleValid: true,
            });
        },

        //If user goes back and changes a section inside Upload, all fields downstream of that section need to clear.
        clearDownstreamFields(section) {
            // Only clear downstream fields in Add mode!
            if (this.get('nodeLocked'))
                return;

            const props = [];

            /* eslint no-fallthrough: 0 */
            switch (section) {
                case 'allUpload':
                    props.push('node');
                case 'belowNode':
                    props.push('selectedFile', 'file');
                case 'belowFile':
                    props.push('convertOrCopy');
                case 'belowConvertOrCopy':
                    props.push('nodeTitle');
                    break;
            }

            const mergeObj = {};

            for (const prop of props)
                mergeObj[prop] = null;

            this.setProperties(mergeObj);
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
                    copyrightHolders: this.get('model.licenseRecord') ? this.get('model.licenseRecord').copyright_holders.join(', ') : ''
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

            const node = this.get('node');
            const model = this.get('model');
            // Saves off current server-state basics fields, so UI can be restored in case of failure
            const currentAbstract = node.get('description');
            const currentTags = node.get('tags').slice();
            const currentDOI = model.get('doi');
            const currentLicenseType = model.get('license');
            const currentLicenseRecord = model.get('licenseRecord');
            const currentNodeLicenseType = node.get('license');
            const currentNodeLicenseRecord = node.get('nodeLicense');
            const copyrightHolders = this.get('basicsLicense.copyrightHolders')
                .split(', ')
                .map(item => item.trim());

            if (this.get('abstractChanged'))
                node.set('description', this.get('basicsAbstract'));

            if (this.get('tagsChanged'))
                node.set('tags', this.get('basicsTags'));

            if (this.get('applyLicense')) {
                if (node.get('nodeLicense.year') !== this.get('basicsLicense.year') || (node.get('nodeLicense.copyrightHolders') || []).join() !== copyrightHolders.join()) {
                    node.set('nodeLicense', {
                        year: this.get('basicsLicense.year'),
                        copyright_holders: copyrightHolders
                    });
                }

                if (node.get('license.name') !== this.get('basicsLicense.licenseType.name')) {
                    node.set('license', this.get('basicsLicense.licenseType'));
                }
            }

            if (this.get('doiChanged')) {
                model.set('doi', this.get('basicsDOI') || null);
            }

            if (this.get('licenseChanged') || !this.get('model.license.name')) {
                model.setProperties({
                    licenseRecord: {
                        year: this.get('basicsLicense.year'),
                        copyright_holders: copyrightHolders
                    },
                    license: this.get('basicsLicense.licenseType')
                });
            }

            Promise.all([
                node.save(),
                model.save()
            ])
                .then(() => this.send('next', this.get('_names.2')))
                // If save fails, do not transition
                .catch(() => {
                    this.get('toast').error(
                        this.get('i18n').t('submit.basics_error')
                    );

                    model.setProperties({
                        licenseRecord: currentLicenseRecord,
                        license: currentLicenseType,
                        doi: currentDOI,
                    });

                    node.setProperties({
                        description: currentAbstract,
                        tags: currentTags,
                        license: currentNodeLicenseType,
                        nodeLicense: currentNodeLicenseRecord,
                    });

                    return Promise.all([
                        node.save(),
                        model.save()
                    ]);
                });
        },

        // Custom addATag method that appends tag to list instead of auto-saving
        addTag(tag) {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'input',
                    action: 'onchange',
                    label: `Preprints - ${this.get('editMode') ? 'Edit' : 'Submit'} - Add Tag`
                });

            this.get('basicsTags').pushObject(tag);
        },

        // Custom removeATag method that removes tag from list instead of auto-saving
        removeTag(tag) {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `Preprints - ${this.get('editMode') ? 'Edit' : 'Submit'} - Remove Tag`
                });

            this.get('basicsTags').removeObject(tag);
        },

        /*
          Discipline section
        */
        setSubjects(subjects) {
            // Sets subjectsList with pending subjects. Does not save.
            this.toggleProperty('disciplineModifiedToggle'); // Need to observe if discipline in nested array has changed. Toggling this will force 'disciplineChanged' to be recalculated
            this.set('subjectsList', subjects);
        },

        discardSubjects() {
            // Discards changes to subjects. (No requests sent, front-end only.)
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `Preprints - ${this.get('editMode') ? 'Edit' : 'Submit'} - Discard Discipline Changes`
                });
            this.set('subjectsList', Ember.$.extend(true, [], this.get('model.subjects')));
        },

        saveSubjects() {
            // Saves subjects (disciplines) and then moves to next section.
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `Preprints - ${this.get('editMode') ? 'Edit' : 'Submit'} - Discipline Save and Continue`
                });
            let model = this.get('model');
            // Current subjects saved so UI can be restored in case of failure
            let currentSubjects = Ember.$.extend(true, [], this.get('model.subjects'));
            let subjectMap = subjectIdMap(this.get('subjectsList'));
            if (this.get('disciplineChanged')) {
                model.set('subjects', subjectMap);
                model.save()
                    .then(() => {
                        this.send('next', this.get('_names.1'));
                    })
                    .catch(() => {
                        model.set('subjects', currentSubjects);
                        this.get('toast').error(this.get('i18n').t('submit.disciplines_error'));
                    });
            } else {
                this.send('next', this.get('_names.1'));
            }
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
            const highlightClass = `${status === 'success' ? 'success' : 'error'}Highlight`;

            context.$('#' + elementId).addClass(highlightClass);

            Ember.run.later(() => context.$('#' + elementId).removeClass(highlightClass), 2000);
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
                    this.transitionToRoute(
                        `${this.get('theme.isSubRoute') ? 'provider.' : ''}content`,
                        model
                    );
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
