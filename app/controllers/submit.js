import Ember from 'ember';

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

function arraysEqual(a, b) {
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
    return subjectArray.slice(0).map(subjectBlock => subjectBlock.map(subject => subject.id));
}

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
    nodeLocked: false, // After advancing beyond Step 1: Upload on Add Preprint form, the node is locked.  Is True on Edit.
    searchResults: [], // List of users matching search query
    savingPreprint: false, // True when Share button is pressed on Add Preprint page
    showModalSharePreprint: false, // True when sharing preprint confirmation modal is displayed
    uploadSaveState: false, // True temporarily when changes have been saved in upload section
    disciplineSaveState: false, // True temporarily when changes have been saved in discipline section
    basicsSaveState: false, // True temporarily when changes have been saved in basics section
    authorsSaveState: false, // True temporarily when changes have been saved in authors section
    parentNode: null, // If component created, parentNode will be defined
    parentContributors: Ember.A(),
    convertProjectConfirmed: false, // User has confirmed they want to convert their existing OSF project into a preprint,
    convertOrCopy: null, // Will either be 'convert' or 'copy' depending on whether user wants to use existing component or create a new component.,
    osfStorageProvider: null, // Preprint node's osfStorage object
    osfProviderLoaded: false, // Preprint node's osfStorageProvider is loaded.
    titleValid: null,  // If node's pending title is valid.

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
            nodeLocked: false, // Will be set to true if edit?
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
        }));
    },

    hasFile: Ember.computed('file', 'selectedFile', function() {
        // True if file has either been preuploaded, or already uploaded file has been selected.
        return this.get('file') !== null || this.get('selectedFile') !== null;
    }),

    ///////////////////////////////////////
    // Validation rules for form sections

    // In order to advance from upload state, node and selectedFile must have been defined, and nodeTitle must be set.
    uploadValid: Ember.computed.and('node', 'selectedFile', 'nodeTitle', 'nodeLocked'),
    abstractValid: Ember.computed.alias('validations.attrs.basicsAbstract.isValid'),
    doiValid: Ember.computed.alias('validations.attrs.basicsDOI.isValid'),
    // Basics fields that are being validated are abstract and doi (title validated in upload section). If validation added for other fields, expand pendingBasicsValid definition.
    basicsValid: Ember.computed.and('abstractValid', 'doiValid'),
    // Must have at least one contributor. Backend enforces admin and bibliographic rules. If this form section is ever invalid, something has gone horribly wrong.
    authorsValid: Ember.computed.bool('contributors.length'),
    // Must select at least one subject.
    disciplineValid: Ember.computed.notEmpty('subjectsList'),
    // All form sections are valid and preprint can be shared.
    allSectionsValid: Ember.computed('uploadValid', 'node.description', 'model.doi', 'authorsValid', 'model.subjects', function() {
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
    abstractChanged: Ember.computed('basicsAbstract', 'node.description', function() {
        var basicsAbstract = this.get('basicsAbstract');
        var nodeDescription = this.get('node.description');
        var changed = false;
        if (basicsAbstract) {
            changed = basicsAbstract.trim() !== nodeDescription;
        }
        return changed;
    }),
    basicsAbstract:  Ember.computed('node.description', function() {
        var node = this.get('node');
        return node ? node.get('description') : null;
    }),
    basicsTags: Ember.computed('node', function() {
        var node = this.get('node');
        // TODO: This may need to provide a default value (list)? Via default or field transform?
        return node ? node.get('tags') : Ember.A();
    }),
    tagsChanged: Ember.computed('basicsTags', 'node.tags', function() {
        var basicsTags = this.get('basicsTags');
        var nodeTags = this.get('node.tags');
        var changed = false;
        if (basicsTags && nodeTags) {
            changed = !(basicsTags.length === nodeTags.length && basicsTags.every((v, i)=> v === nodeTags[i]));
        }
        return changed;
    }),
    basicsDOI: Ember.computed('model', function() {
        return this.get('model.doi');
    }),
    doiChanged: Ember.computed('model.doi', 'basicsDOI', function() {
        //TODO fix DOI's value changes from undefined to null?
        return this.get('basicsDOI') != this.get('model.doi');
    }),
    basicsChanged: Ember.computed('tagsChanged', 'abstractChanged', 'doiChanged', function() {
        return this.get('tagsChanged') || this.get('abstractChanged') || this.get('doiChanged');
    }),
    subjectsList: Ember.computed('model.subjects.@each', function() {
        return this.get('model.subjects') ? this.get('model.subjects').slice(0) : Ember.A();
    }),
    disciplineReduced: Ember.computed('model.subjects', function() {
        return this.get('model.subjects').reduce((acc, val) => acc.concat(val), []).uniqBy('id');
    }),
    disciplineChanged: Ember.computed('model.subjects.@each', 'subjectsList.@each', function() {
        return !(arraysEqual(subjectIdMap(this.get('model.subjects')), subjectIdMap(this.get('subjectsList'))));
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
            // Locks file and node so that they cannot be modified.  Occurs after upload step is complete.
            this.set('nodeLocked', true);
        },
        finishUpload() {
            // Locks file and node and advances to next form section.
            this.send('lockNode');
            this.get('node.files').then((files) => {
                this.set('osfStorageProvider', files.findBy('name', 'osfstorage'));
                this.set('osfProviderLoaded', true);
                this.send('next', this.get('_names.0'));
            });
        },
        existingNodeExistingFile() {
            // Upload case for using existing node and existing file for the preprint.  If title has been edited, updates title.
            var node = this.get('node');
            if (node.title !== this.get('nodeTitle')) {
                node.set('title', this.get('nodeTitle'));
                node.save()
                    .then(() => {
                        this.send('startPreprint');
                    })
                    .then(() => {
                        this.get('toast').info('Preprint file uploaded!');
                        this.send('finishUpload');

                    })
                    .catch(() => this.get('toast').error('Could not save information; please try again.'));

            } else {
                this.send('startPreprint')
                    .then(() => {
                        this.get('toast').info('Preprint file uploaded!');
                        this.send('finishUpload');
                    })
                    .catch(() => this.get('toast').error('Could not save information; please try again.'));
            }
        },
        editExistingFileAndTitle() {
            // Edit mode - Change preprint file to an existing file and/or update node title.
            var node = this.get('node');
            node.set('title', this.get('nodeTitle'));
            node.save()
                .then(() => {
                    this.send('editPreprintFile');
                })
                .then(() => {
                    this.get('toast').info('Preprint file updated!');
                    this.send('finishUpload');
                });
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
                    })
                    .then(() => {
                        this.send('startPreprint');
                    })
                        .then(() => {
                            this.get('toast').info('Preprint file uploaded!');
                            this.send('finishUpload');
                        })
                        .catch(() => this.get('toast').error('Could not save information; please try again.'));
                });
            });
        },
        startPreprint() {
            let model = this.get('model');
            model.set('primaryFile', this.get('selectedFile'));
            model.set('node', this.get('node'));
            model.set('provider', 'osf');
            this.set('filePickerState', State.EXISTING);
            return model.save();
        },
        editPreprintFile() {
            let model = this.get('model');
            if (model.get('primaryFile.id') !== this.get('selectedFile.id')) {
                model.set('primaryFile', this.get('selectedFile'));
            }
            return model.save();
        },
        selectExistingFile(file) {
            // Takes file chosen from file-browser and sets equal to selectedFile. This file will become the preprint.
            this.set('selectedFile', file);
        },
        clearDownstreamFields(section) {
            //If user goes back and changes a section inside Upload, all fields downstream of that section need to clear.
            if (!this.get('nodeLocked')) { // Only clear downstream fields in Add mode!
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
            }
        },
        /*
          Basics section
         */
        discardBasics() {
            this.set('basicsTags', this.get('node.tags'));
            this.set('basicsAbstract', this.get('node.description'));
            this.set('basicsDOI', this.get('model.doi'));
        },
        saveBasics() {
            // Saves the description/tags on the node and the DOI on the preprint, then advances to next panel
            // If save fails, do not transition
            let node = this.get('node');
            var model = this.get('model');

            node.set('description', this.get('basicsAbstract'));
            node.set('tags', this.get('basicsTags'));
            model.set('doi', this.get('basicsDOI'));
            if (model.get('doi') === '') {
                model.set('doi', null);
            }
            node.save().then(() => {
                model.save().then(() => {
                    this.send('next', this.get('_names.2'));
                });
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
            this.set('subjectsList', subjects);
        },

        discardSubjects() {
            this.set('subjectsList', this.get('model.subjects').slice(0));
        },

        saveSubjects() {
            // Saves subjects (disciplines) and then moves to next section.
            var model = this.get('model');
            var subjectMap = subjectIdMap(this.get('subjectsList'));
            model.set('subjects', subjectMap);
            model.save()
                .then(() => {
                    this.send('next', this.get('_names.1'));
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
            // TODO: Check validation status of all sections before submitting
            // TODO: Make sure subjects is working so request doesn't get rejected
            // TODO: Test and get this code working
            let model = this.get('model');
            let node = this.get('node');
            this.set('savingPreprint', true);
            model.set('isPublished', true);
            node.set('public', true);

            return model.save()
                .then(() => node.save().then(() => {
                    this.transitionToRoute('content', model);
                }));
        },
    }
});
