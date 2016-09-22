import Ember from 'ember';
import config from 'ember-get-config';

import { validator, buildValidations } from 'ember-cp-validations';

import permissions from 'ember-osf/const/permissions';
import NodeActionsMixin from 'ember-osf/mixins/node-actions';
import TaggableMixin from 'ember-osf/mixins/taggable-mixin';

import loadAll from 'ember-osf/utils/load-relationship';

// Enum of available upload states
export const State = Object.freeze(Ember.Object.create({
    START: 'start',
    NEW: 'new',
    EXISTING: 'existing'
}));

/*****************************
  Form data and validations
 *****************************/
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
                regex: /^10\.\S+\//,
                allowBlank: true,
                message: 'Please use a valid {description}'
            })
        ]
    }
});

/**
 * "Add preprint" page definitions
 */
export default Ember.Controller.extend(BasicsValidations, NodeActionsMixin, TaggableMixin, {
    _State: State,
    filePickerState: State.START,
    fileManager: Ember.inject.service(),
    toast: Ember.inject.service('toast'),
    panelActions: Ember.inject.service('panelActions'),
    _names: ['upload', 'discipline', 'basics', 'authors', 'submit'].map(str => str.capitalize()),

    // Data for project picker; tracked internally on load
    user: null,
    userNodes: Ember.A(),
    userNodesLoaded: false,

    // Information about the thing to be turned into a preprint
    node: null, // Project or component containing the preprint
    file: null, // Preuploaded file - file that has been dragged to dropzone, but not uploaded to node.
    selectedFile: null, // File that will be the preprint (already uploaded to node or selected from existing node)
    contributors: Ember.A(), // Contributors on preprint - if creating a component, contributors will be copied over from parent
    nodeTitle: null, // Preprint title
    fileAndNodeLocked: false, // After advancing beyond Step 1: Upload on Add Preprint form, both the file and node are locked
    searchResults: [], // List of users matching search query
    savingPreprint: false, // True when Share button is pressed on Add Preprint page
    showModalSharePreprint: false, // True when sharing preprint confirmation modal is displayed
    uploadSaveState: false, // True temporarily when changes have been saved in upload section
    disciplineSaveState: false, // True temporarily when changes have been saved in discipline section
    basicsSaveState: false, // True temporarily when changes have been saved in basics section
    authorsSaveState: false, // True temporarily when changes have been saved in authors section
    parentNode: null, // If component created, parentNode will be defined
    convertProjectConfirmed: false, // User has confirmed they want to convert their existing OSF project into a preprint,
    convertOrCopy: null, // Will either be 'convert' or 'copy' depending on whether user wants to use existing component or create a new component.

    isTopLevelNode: Ember.computed('node', function() {
        // Returns true if node is a top-level node
        var node = this.get('node');
        return node ? (node.get('id') === node.get('root.id')) : null;
    }),
    clearFields() {
        // Restores submit form defaults.  Called when user submits preprint, then hits back button, for example.
        this.get('panelActions').open('Upload');
        this.get('panelActions').close('Submit');

        this.setProperties(Ember.merge(
            this.get('_names').reduce((acc, name) => Ember.merge(acc, {[`${name.toLowerCase()}SaveState`]: false}), {}), {
            user: null,
            userNodes: Ember.A(),
            node: null,
            file: null,
            hasFile: false,
            selectedFile: null,
            contributors: Ember.A(),
            nodeTitle: null,
            fileAndNodeLocked: false,
            filePickerState: State.START,
            searchResults: [],
            savingPreprint: false,
            showModalSharePreprint: false,
            uploadSaveState: false,
            basicsSaveState: false,
            authorsSaveState: false,
            disciplineSaveState: false,
            parentNode: null,
            convertProjectConfirmed: false,
            basicsAbstract: null,
        }));
    },

    hasFile: Ember.computed('file', 'selectedFile', function() {
        // True if file has either been preuploaded, or already uploaded file has been selected.
        return this.get('file') || this.get('selectedFile');
    }),

    ///////////////////////////////////////
    // Validation rules for form sections

    // In order to advance from upload state, node and selectedFile must have been defined, and nodeTitle must be set.
    uploadValid: Ember.computed.and('node', 'selectedFile', 'nodeTitle'),
    abstractValid: Ember.computed.alias('validations.attrs.basicsAbstract.isValid'),
    doiValid: Ember.computed.alias('validations.attrs.basicsDOI.isValid'),
    // Basics fields that are being validated are abstract and doi (title validated in upload section). If validation added for other fields, expand basicsValid definition.
    basicsValid: Ember.computed.and('abstractValid', 'doiValid'),
    // Must have at least one contributor. Backend enforces admin and bibliographic rules. If this form section is ever invalid, something has gone horribly wrong.
    authorsValid: Ember.computed.bool('contributors.length'),
    // Must select at least one subject.
    disciplineValid: Ember.computed.notEmpty('model.subjects'),
    // All form sections are valid and preprint can be shared.
    allSectionsValid: Ember.computed('uploadValid', 'basicsValid', 'authorsValid', 'disciplineValid', function() {
        return this.get('uploadValid') && this.get('basicsValid') && this.get('authorsValid') && this.get('disciplineValid');
    }),

    ////////////////////////////////////////////////////
    // Fields used in the "basics" section of the form.
    // Proxy for "basics" section, to support autosave when fields change (created when model selected)
    basicsModel: Ember.computed.alias('node'),
    basicsTitle: Ember.computed('node', function() {
        var node = this.get('node');
        return node ? node.get('title') : null;
    }),
    basicsAbstract:  Ember.computed('node', function() {
        var node = this.get('node');
        return node ? node.get('description') : null;
    }),
    basicsTags: Ember.computed('node', function() {
        var node = this.get('node');
        // TODO: This may need to provide a default value (list)? Via default or field transform?
        return node ? node.get('tags') : null;
    }),
    basicsDOI: Ember.computed.alias('model.doi'),

    getContributors: Ember.observer('node', function() {
        // Returns all contributors of node that will be container for preprint.  Makes sequential requests to API until all pages of contributors have been loaded
        // and combines into one array

        // Cannot be called until a project has been selected!
        if (!this.get('node')) return [];

        let node = this.get('node');
        let contributors = Ember.A();
        loadAll(node, 'contributors', contributors).then(()=>
             this.set('contributors', contributors));
    }),

    isAdmin: Ember.computed('node', function() {
        // True if the current user has admin permissions
        // FIXME: Workaround for isAdmin variable not making sense until a node has been loaded
        let userPermissions = this.get('node.currentUserPermissions') || [];
        return userPermissions.indexOf(permissions.ADMIN) >= 0;
    }),

    canEdit: Ember.computed('isAdmin', 'node', function() {
        // True if the current user is and admin and the node is not a registration.
        return this.get('isAdmin') && !(this.get('node.registration'));
    }),

    actions: {
        next(currentPanelName) {
            // Open next panel
            if (currentPanelName === 'Upload' || currentPanelName === 'Basics') {
                Ember.run.scheduleOnce('afterRender', this, function() {
                    MathJax.Hub.Queue(['Typeset', MathJax.Hub, Ember.$(currentPanelName === 'Upload' ? '.preprint-header-preview' : '.abstract')[0]]);  // jshint ignore:line
                });
            }
            this.get('panelActions').open(this.get(`_names.${this.get('_names').indexOf(currentPanelName) + 1}`));
            this.send('changesSaved', currentPanelName);
        },
        changesSaved(currentPanelName) {
            // Temporarily changes panel save state to true.  Used for flashing 'Changes Saved' in UI.
            var currentPanelSaveState = currentPanelName.toLowerCase() + 'SaveState';
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
        changeState(newState) {
            // Sets filePickerState to newState - this is the initial decision on the form.
            this.set('filePickerState', newState);
            if (newState === this.get('_State').EXISTING) {
                this.get('panelActions').open('chooseProject');
                this.get('panelActions').close('selectExistingFile');
                this.get('panelActions').close('uploadNewFile');
                this.get('panelActions').close('organize');
                this.get('panelActions').close('finalizeUpload');
            }
        },
        changeToInitialState(newState) {
            // Changes state to initial upload state presenting choice: Upload new preprint or connect preprint to existing OSF project
            this.send('changeState', newState);
            this.send('clearDownstreamFields', 'allUpload');
        },
        lockFileAndNode() {
            // Locks file and node so that they cannot be modified.  Occurs after upload step is complete.
            this.set('fileAndNodeLocked', true);
        },
        finishUpload() {
            // Locks file and node and advances to next form section.
            this.send('lockFileAndNode');
            this.send('next', this.get('_names.0'));
        },
        existingNodeExistingFile() {
            // Upload case for using existing node and existing file for the preprint.  If title has been edited, updates title.
            var node = this.get('node');
            if (node.title !== this.get('nodeTitle')) {
                node.set('title', this.get('nodeTitle'));
                node.save().then(() => {
                    this.send('finishUpload');
                });
            } else {
                this.send('finishUpload');
            }
        },
        createComponentCopyFile() {
            // Upload case for using a new component and an existing file for the preprint. Creates a component and then copies
            // file from parent node to new component.

            var node = this.get('node');
            node.addChild(this.get('nodeTitle')).then(child => {
                this.set('parentNode', node);
                this.set('node', child);
                child.get('files').then((providers) => {
                    var osfstorage = providers.findBy('name', 'osfstorage');
                    this.get('fileManager').copy(this.get('selectedFile'), osfstorage, {data: {resource: child.id}}).then((copiedFile) => {
                        this.set('selectedFile', copiedFile);
                    });
                }).then(() => {
                    this.get('toast').info('File copied to component!');
                    this.send('finishUpload');
                }, () => {
                    this.get('toast').info('Could not create component.');
                });
            });
        },
        editTitleNext(section) {
            // Edits title when user returns to upload section after upload section has already been completed.
            this.set('node.title', this.get('nodeTitle'));
            Ember.run.scheduleOnce('afterRender', this, function() {
                MathJax.Hub.Queue(['Typeset', MathJax.Hub, Ember.$('.preprint-header-preview')[0]]);  // jshint ignore:line
            });
            this.send('next', section);
        },
        selectExistingFile(file) {
            // Takes file chosen from file-browser and sets equal to selectedFile. This file will become the preprint.
            this.set('selectedFile', file);
        },
        clearDownstreamFields(section) {
            //If user goes back and changes a section inside Upload, all fields downstream of that section need to clear.
            switch (section) {
                case 'allUpload':
                    this.set('node', null);
                    this.set('selectedFile', null);
                    this.set('hasFile', false);
                    this.set('file', null);
                    this.set('convertOrCopy', null);
                    this.set('nodeTitle', null);
                    break;
                case 'belowNode':
                    this.set('selectedFile', null);
                    this.set('hasFile', false);
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
        },
        /*
          Basics section
         */
        saveBasics() {
            // Save the model associated with basics field, then advance to next panel
            // If save fails, do not transition
            let node = this.get('node');
            node.set('description', this.get('basicsAbstract'));
            node.save()
                .then(() => this.send('next', this.get('_names.2')))
                .catch(()=> this.send('error', 'Could not save information; please try again'));
        },

        saveSubjects(subjects) {
            // If save fails, do not transition
            this.set('model.subjects', subjects);
        },

        subjectsNext() {
            this.send('next', this.get('_names.1'));
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
            return this.store.query('user', {
                filter: {
                    'full_name,given_name,middle_names,family_name': query
                },
                page: page
            }).then((contributors) => {
                this.set('searchResults', contributors);
                return contributors;
            }).catch(() => {
                this.get('toast').error('Could not perform search query.');
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
            Ember.run.next(Ember.Object.create({ elementId: elementId, context: context }), function() {
                var elementId = this.elementId;
                var _this = this.context;

                var highlightClass =  status === 'success' ? 'successHighlight' : 'errorHighlight';

                _this.$('#' + elementId).addClass(highlightClass);

                setTimeout(() => {
                    _this.$('#' + elementId).removeClass(highlightClass);
                }, 2000);
            });
        },
        /*
          Submit tab actions
         */
        toggleSharePreprintModal() {
            // Toggles display of share preprint modal
            this.toggleProperty('showModalSharePreprint');
        },
        savePreprint() {
            // Converts 'node' into a preprint, with its primaryFile as the 'selectedFile'.
            // TODO: Check validation status of all sections before submitting
            // TODO: Make sure subjects is working so request doesn't get rejected
            // TODO: Test and get this code working
            let model = this.get('model');
            model.setProperties({
                id: this.get('node.id'),
                primaryFile: this.get('selectedFile')
            });
            this.set('savingPreprint', true);
            if (model.get('doi') === '') {
                model.set('doi', undefined);
            }
            model.save()
                // Ember data is not worth the time investment currently
                .then(() =>  this.store.adapterFor('preprint').ajax(model.get('links.relationships.providers.links.self.href'), 'PATCH', {
                    data: {
                        data: [{
                            type: 'preprint_providers',
                            id: config.PREPRINTS.provider,
                        }]
                    }
                }))
                .then(() => model.get('providers'))
                .then(() => this.transitionToRoute('content', model))
                .catch(() => this.send('error', 'Could not save preprint; please try again later'));
        },
    }
});
