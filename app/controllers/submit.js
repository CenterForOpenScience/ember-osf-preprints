import Ember from 'ember';
import config from 'ember-get-config';

import { validator, buildValidations } from 'ember-cp-validations';

import permissions from 'ember-osf/const/permissions';
import NodeActionsMixin from 'ember-osf/mixins/node-actions';
import TaggableMixin from 'ember-osf/mixins/taggable-mixin';

import loadAll from 'ember-osf/utils/load-relationship';

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
                regex: /\b(10\.\d{4,}(?:\.\d+)*\/\S+(?:(?!["&\'<>])\S))\b/,
                allowBlank: true,
                message: 'Please use a valid {description}'
            })
        ]
    }
});

/*****************************
 Helper function to determine if discipline has changed (comparing list of lists)
 *****************************/
function disciplineArraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (var i = 0; i < a.length; ++i) {
        if (a[i].length !== b[i].length) return false;
        for (var j = 0; j < a[i].length; ++j) {
            if (a[i][j] !== b[i][j]) return false;
        }
    }
    return true;
}

function subjectIdMap(subjectArray) {
    // Maps array of arrays of disciplines into array of arrays of discipline ids.
    return subjectArray.slice(0).map(subjectBlock => subjectBlock.map(subject => subject.id));
}

/**
 * "Add preprint" page definitions
 */
export default Ember.Controller.extend(BasicsValidations, NodeActionsMixin, TaggableMixin, {
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

    // Information about the thing to be turned into a preprint
    node: null, // Project or component containing the preprint
    file: null, // Preuploaded file - file that has been dragged to dropzone, but not uploaded to node.
    selectedFile: null, // File that will be the preprint (already uploaded to node or selected from existing node)
    contributors: Ember.A(), // Contributors on preprint - if creating a component, contributors will be copied over from parent
    nodeTitle: null, // Preprint title
    nodeLocked: false, // After advancing beyond Step 1: Upload on Add Preprint form, the node is locked.  Is True on Edit.
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

    isTopLevelNode: Ember.computed('node', function() {
        // Returns true if node is a top-level node
        var node = this.get('node');
        if (node) {
            return node.get('parent.id') ? false : true;
        } else {
            return null;
        }
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
            disciplineModifiedToggle: false,
            uploadInProgress: false
        }));
    },

    ///////////////////////////////////////
    // Validation rules for form sections

    // In order to advance from upload state, node and selectedFile must have been defined, and nodeTitle must be set.
    uploadValid: Ember.computed.alias('nodeLocked'),
    abstractValid: Ember.computed.alias('validations.attrs.basicsAbstract.isValid'),
    doiValid: Ember.computed.alias('validations.attrs.basicsDOI.isValid'),
    // Basics fields that are being validated are abstract and doi (title validated in upload section). If validation added for other fields, expand pendingBasicsValid definition.
    basicsValid: Ember.computed.and('abstractValid', 'doiValid'),
    // Must have at least one contributor. Backend enforces admin and bibliographic rules. If this form section is ever invalid, something has gone horribly wrong.
    authorsValid: Ember.computed.bool('contributors.length'),
    // Must select at least one subject.
    disciplineValid: Ember.computed.notEmpty('subjectsList'),
    // Does node have a saved title?
    savedTitle: Ember.computed('node.title', function() {
        return this.get('node.title') !== null;
    }),
    // Does preprint have a saved primaryFile?
    savedFile: Ember.computed('model.primaryFile', function() {
        return this.get('model.primaryFile') !== null;
    }),
    // Does node have a saved description?
    savedAbstract: Ember.computed('node.description', function() {
        return this.get('node.description') !== null && this.get('node.description') !== '';
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
        var node = this.get('node');
        return node ? node.get('description') : null;
    }),
    abstractChanged: Ember.computed('basicsAbstract', 'node.description', function() {
        // Does the pending abstract differ from the saved abstract in the db?
        var basicsAbstract = this.get('basicsAbstract');
        var nodeDescription = this.get('node.description');
        var changed = false;
        if (basicsAbstract) {
            changed = basicsAbstract.trim() !== nodeDescription;
        }
        return changed;
    }),
    basicsTags: Ember.computed('node', function() {
        // Pending tags
        var node = this.get('node');
        // TODO: This may need to provide a default value (list)? Via default or field transform?
        return node ? node.get('tags') : Ember.A();
    }),
    tagsChanged: Ember.computed('basicsTags', 'node.tags', function() {
        // Does the list of pending tags differ from the saved tags in the db?
        var basicsTags = this.get('basicsTags');
        var nodeTags = this.get('node.tags');
        var changed = false;
        if (basicsTags && nodeTags) {
            changed = !(basicsTags.length === nodeTags.length && basicsTags.every((v, i)=> v === nodeTags[i]));
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
        return (this.get('basicsDOI') || this.get('model.doi')) ? this.get('basicsDOI') !== this.get('model.doi') : false;
    }),
    basicsChanged: Ember.computed('tagsChanged', 'abstractChanged', 'doiChanged', function() {
        // Are there any unsaved changes in the basics section?
        return this.get('tagsChanged') || this.get('abstractChanged') || this.get('doiChanged');
    }),
    ////////////////////////////////////////////////////
    // Fields used in the "discipline" section of the form.
    ////////////////////////////////////////////////////
    subjectsList: Ember.computed('model.subjects.@each', function() {
        // Pending subjects
        return this.get('model.subjects') ? this.get('model.subjects').slice(0) : Ember.A();
    }),
    disciplineReduced: Ember.computed('model.subjects', function() {
        // Flattened subject list
        return this.get('model.subjects').slice(0).reduce((acc, val) => acc.concat(val), []).uniqBy('id');
    }),
    disciplineChanged: Ember.computed('model.subjects.@each.subject', 'subjectsList.@each.subject', 'disciplineModifiedToggle',  function() {
        // Are there any unsaved changes in the discipline section?
        return !(disciplineArraysEqual(subjectIdMap(this.get('model.subjects')), subjectIdMap(this.get('subjectsList'))));
    }),

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

    getNodePreprints: Ember.observer('node', function() {
        // Returns any existing preprints stored on the current node

        // Cannot be called until a project has been selected!
        if (!this.get('node')) return [];
        let node = this.get('node');

        node.get('preprints').then((preprints) => {
            this.set('existingPreprints', preprints);
            if (preprints.toArray().length > 0) { // If node already has a preprint
                var preprint = preprints.toArray()[0]; // TODO once branded is finished, this will change
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
        nextUploadSection(currentUploadPanel, nextUploadPanel) {
            // Opens next panel within the Upload Section, Existing Workflow (Choose Project - Choose File - Organize - Finalize Upload)
            this.get('panelActions').toggle(currentUploadPanel);
            this.get('panelActions').toggle(nextUploadPanel);
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
        changeInitialState(newState) {
            // Sets filePickerState to start, new, or existing - this is the initial decision on the form.
            this.set('filePickerState', newState);
            this.send('clearDownstreamFields', 'allUpload');
            if (newState === this.get('_State').EXISTING) {
                this.get('panelActions').open('chooseProject');
                this.get('panelActions').close('selectExistingFile');
                this.get('panelActions').close('uploadNewFile');
                this.get('panelActions').close('organize');
                this.get('panelActions').close('finalizeUpload');
            }
        },
        lockNode() {
            // Locks node so that preprint location cannot be modified.  Occurs after upload step is complete.
            this.set('nodeLocked', true);
        },
        finishUpload() {
            // Locks node and advances to next form section.
            this.send('lockNode');
            this.get('node.files').then((files) => {
                this.set('osfStorageProvider', files.findBy('name', 'osfstorage'));
                this.set('osfProviderLoaded', true);
                this.set('file', null);
                // Closes section, so all panels closed if Upload section revisited
                this.get('panelActions').close('uploadNewFile');
                this.send('next', this.get('_names.0'));
            });
        },
        existingNodeExistingFile() {
            // Upload case for using existing node and existing file for the preprint.  If title has been edited, updates title.
            var node = this.get('node');
            if (node.get('title') !== this.get('nodeTitle')) {
                var currentTitle = node.get('title');
                node.set('title', this.get('nodeTitle'));
                node.save()
                    .then(() => this.get('abandonedPreprint') ? this.send('resumeAbandonedPreprint') : this.send('startPreprint'))
                    .catch(() => {
                        node.set('title', currentTitle);
                        this.get('toast').error('Error updating title. Please try again.');
                    });

            } else {
                return this.get('abandonedPreprint') ? this.send('resumeAbandonedPreprint') : this.send('startPreprint');
            }
        },
        createComponentCopyFile() {
            // Upload case for using a new component and an existing file for the preprint. Creates a component and then copies
            // file from parent node to new component.
            var node = this.get('node');
            node.addChild(this.get('nodeTitle'))
                .then(child => {
                    this.set('parentNode', node);
                    this.set('node', child);
                    this.set('basicsAbstract', this.get('node.description'));
                    child.get('files')
                        .then((providers) => {
                            var osfstorage = providers.findBy('name', 'osfstorage');
                            this.get('fileManager').copy(this.get('selectedFile'), osfstorage, {data: {resource: child.id}})
                                .then((copiedFile) => {
                                    this.set('selectedFile', copiedFile);
                                    this.send('startPreprint', this.get('parentNode'));
                                })
                                .catch(() => this.get('toast').error('Error copying file; please try again.'));
                        })
                        .catch(() => {
                            this.get('toast').error('Error accessing parent files. Please try again.');
                        });
                })
                .catch(() => {
                    this.get('toast').error('Could not create component. Please try again.');
                });

        },
        resumeAbandonedPreprint() {
            // You can only have one preprint per provider. For now, we delete the abandoned preprint so another preprint can be created.
            var preprintRecord = this.store.peekRecord('preprint', this.get('abandonedPreprint').id);
            preprintRecord.destroyRecord()
                .then(() => {
                    this.send('startPreprint');
                })
                .catch(() => {
                    this.get('toast').error('Error with abandoned preprint. Please try again.');
                });
        },
        startPreprint(parentNode) {
            // Initiates preprint.  Occurs in Upload section of Add Preprint form when pressing 'Save and continue'.  Creates a preprint with
            // primaryFile, node, and provider fields populated.
            let model = this.get('model');
            let provider = this.get('store').peekRecord('preprint-provider', config.PREPRINTS.provider);

            model.set('primaryFile', this.get('selectedFile'));
            model.set('node', this.get('node'));
            model.set('provider', provider);

            return model.save()
                .then(() => {
                    this.set('filePickerState', State.EXISTING); // Sets upload form state to existing project (now that project has been created)
                    this.set('existingState', existingState.NEWFILE); // Sets file state to new file, for edit mode.
                    this.set('file', null);
                    this.get('toast').info('Preprint file uploaded!');
                    this.send('finishUpload');
                })
                .catch(() => {
                    this.set('uploadInProgress', false); // Setting to false allows user to attempt operation again.
                    if (parentNode) { // If creating preprint failed after a component was created, set the node back to the parentNode.
                        // If user tries to initiate preprint again, a separate component will be created under the parentNode.
                        this.set('node', parentNode);
                    }
                    this.get('toast').error('Could not initiate preprint. Please try again.');
                });
        },
        selectExistingFile(file) {
            // Takes file chosen from file-browser and sets equal to selectedFile. This file will become the preprint.
            this.set('selectedFile', file);
        },
        discardUploadChanges() {
            // Discards upload section changes in edit mode.  Restores displayed file to current preprint primaryFile
            // and resets displayed title to current node title. (No requests sent, front-end only.)
            var currentFile = this.get('store').peekRecord('file', this.get('model.primaryFile.id'));
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
            // Discards changes to basic fields in Edit mode. (No requests sent, front-end only.)
            this.set('basicsTags', this.get('node.tags'));
            this.set('basicsAbstract', this.get('node.description'));
            this.set('basicsDOI', this.get('model.doi'));
        },
        saveBasics() {
            // Saves the description/tags on the node and the DOI on the preprint, then advances to next panel
            let node = this.get('node');
            var model = this.get('model');
            // Saves off current server-state basics fields, so UI can be restored in case of failure
            var currentAbstract = node.get('description');
            var currentTags = node.get('tags').slice(0);
            var currentDOI = model.get('doi');

            if (this.get('abstractChanged')) node.set('description', this.get('basicsAbstract'));
            if (this.get('tagsChanged')) node.set('tags', this.get('basicsTags'));
            if (this.get('doiChanged')) {
                model.set('doi', this.get('basicsDOI'));
                if (model.get('doi') === '') {
                    model.set('doi', null);
                }
            }

            node.save()
                .then(() => {
                    model.save().then(() => {
                        this.send('next', this.get('_names.2'));
                    });
                })
                // If save fails, do not transition
                .catch(() => {
                    node.set('description', currentAbstract);
                    node.set('tags', currentTags);
                    model.set('doi', currentDOI);
                    this.get('toast').error('Error saving basics fields.');
                });
        },

        addTag(tag) {
            // Custom addATag method that appends tag to list instead of auto-saving
            var tags = this.get('basicsTags').slice(0);
            Ember.A(tags);
            tags.pushObject(tag);
            this.set('basicsTags', tags);
            return tags;
        },

        removeTag(tag) {
            // Custom removeATag method that removes tag from list instead of auto-saving
            var tags = this.get('basicsTags').slice(0);
            tags.splice(tags.indexOf(tag), 1);
            this.set('basicsTags', tags);
            return tags;

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
            // Discards changes to subjects in Edit mode. (No requests sent, front-end only.)
            this.set('subjectsList', this.get('model.subjects').slice(0));
        },

        saveSubjects() {
            // Saves subjects (disciplines) and then moves to next section.
            var model = this.get('model');
            var currentSubjects = model.get('subjects').slice(0);
            var subjectMap = subjectIdMap(this.get('subjectsList'));
            model.set('subjects', subjectMap);
            model.save()
                .then(() => {
                    this.send('next', this.get('_names.1'));
                })
                .catch(() => {
                    model.set('subjects', currentSubjects);
                    this.get('toast').error('Error saving discipline(s).');
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
            // Finalizes saving of preprint.  Publishes preprint and turns node public.
            let model = this.get('model');
            let node = this.get('node');
            this.set('savingPreprint', true);
            this.toggleProperty('shareButtonDisabled');
            model.set('isPublished', true);
            node.set('public', true);

            // If error, this is caught in the confirm-share-preprint component
            return model.save()
                .then(() => node.save().then(() => {
                    if (this.get('editMode')) {
                        window.location = window.location.pathname; //TODO Ember way to do this?  In edit mode, already in content route.
                    } else {
                        this.transitionToRoute('content', model);
                    }
                }))
                .catch(() => {
                    this.toggleProperty('shareButtonDisabled');
                    return this.get('editMode') ? this.get('toast').error('Error completing preprint.') : this.toast.error('Could not save preprint; please try again later');

                });
        },
    }
});
