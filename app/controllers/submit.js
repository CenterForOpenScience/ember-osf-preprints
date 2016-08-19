import Ember from 'ember';

import { validator, buildValidations } from 'ember-cp-validations';

import permissions from 'ember-osf/const/permissions';
import NodeActionsMixin from 'ember-osf/mixins/node-actions';
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
    basicsTitle: {
        description: 'Title',
        validators: [
            validator('presence', true),
            validator('length', {
                // minimum length for title?
                max: 200,
            })
        ]
    },
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
                // Regex taken from http://stackoverflow.com/questions/27910/finding-a-doi-in-a-document-or-page
                regex: /\b(10[.][0-9]{4,}(?:[.][0-9]+)*(?:(?!["&\'<>])\S)+)\b/,
                allowBlank: true,
                message: 'Please use a valid {description}'
            })
        ]
    }
});

/**
 * "Add preprint" page definitions
 */
export default Ember.Controller.extend(BasicsValidations, NodeActionsMixin, {
    toast: Ember.inject.service('toast'),
    panelActions: Ember.inject.service('panelActions'),

    // Data for project picker; tracked internally on load
    user: null,
    userNodes: Ember.A(),

    // Information about the thing to be turned into a preprint
    selectedNode: null,
    selectedFile: null,
    contributors: Ember.A(),

    ///////////////////////////////////////
    // Validation rules for form sections
    uploadValid: Ember.computed.and('selectedNode', 'selectedFile'),
    // Basics fields are currently the only ones with validation. Make this more specific in the future if we add more form fields.
    basicsValid: Ember.computed.alias('validations.isValid'),
    // Must have at least one contributor. Backend enforces admin and bibliographic rules. If this form section is ever invalid, something has gone horribly wrong.
    authorsValid: Ember.computed.bool('contributors.length'),
    // Must select at least one subject. TODO: Verify this is the appropriate way to track
    subjectsValid: Ember.computed.bool('sortedSelection.length'),

    ////////////////////////////////////////////////////
    // Fields used in the "basics" section of the form.
    // Proxy for "basics" section, to support autosave when fields change (created when model selected)
    basicsModel: Ember.computed.alias('selectedNode'),

    basicsTitle: Ember.computed.alias('basicsModel.title'),
    basicsAbstract: Ember.computed.alias('basicsModel.description'),
    basicsTags: Ember.computed.alias('basicsModel.tags'), // TODO: This may need to provide a default value (list)? Via default or field transform?
    basicsDOI: Ember.computed.alias('model.doi'),

    //// TODO: Turn off autosave functionality for now. Direct 2-way binding was causing a fight between autosave and revalidation, so autosave never fired. Fixme.
    // createAutosave: Ember.observer('selectedNode', function() {
    //     // Create autosave proxy only when a node has been loaded.
    //     // TODO: This could go badly if a request is in flight when trying to destroy the proxy
    //
    //     var controller = this;
    //     this.set('basicsModel', autosave('selectedNode', {
    //         save(model) {
    //             // Do not save fields if validation fails.
    //             console.log('trying autosave');
    //             if (controller.get('basicsValid')) {
    //                 console.log('decided to autosave');
    //                 model.save();
    //             }
    //         }
    //     }));
    // }),

    getContributors: Ember.observer('selectedNode', function() {
        // Cannot be called until a project has been selected!
        let node = this.get('selectedNode');
        let contributors = Ember.A();
        loadAll(node, 'contributors', contributors).then(()=>
             this.set('contributors', contributors));
    }),

    // Upload variables
    _State: State,
    filePickerState: State.START,
    uploadState: State.START,
    uploadFile: null,
    resolve: null,
    shouldCreateChild: false,
    dropzoneOptions: {
        uploadMultiple: false,
        method: 'PUT'
    },

    isAdmin: Ember.computed('selectedNode', function() {
        // FIXME: Workaround for isAdmin variable not making sense until a node has been loaded
        let userPermissions = this.get('selectedNode.currentUserPermissions') || [];
        return userPermissions.indexOf(permissions.ADMIN) >= 0;
    }),

    canEdit: Ember.computed('isAdmin', 'selectedNode', function() {
        return this.get('isAdmin') && !(this.get('selectedNode.registration'));
    }),

    searchResults: [],

    _names: ['upload', 'basics', 'subjects', 'authors', 'submit'].map(str => str.capitalize()),

    /*
    * Subjects section: display taxonomy
    */
    topFilter: '',
    midFilter: '',
    botFilter: '',
    updateFilteredPath() {
        var _this = this;
        var overallPath = [];
        var paths = this.get('path').slice(0, 2);
        if (paths.length === 1) {
            _this.get('store').query('taxonomy', { filter: { parent_ids: paths[0].id }, page: { size: 100 } }).then(results => {
                Ember.set(paths[0], 'children', results.map(
                    function(result) { return { name: result.get('text'), id: result.id }; }
                ));
                overallPath.push(paths[0]);
                _this.set('filteredPath', overallPath);
            });
        } else if (paths.length === 2) {
            _this.get('store').query('taxonomy', { filter: { parent_ids: paths[0].id }, page: { size: 100 } }).then(results => {
                Ember.set(paths[0], 'children', results.map(
                    function(result) { return { name: result.get('text'), id: result.id }; }
                ));
                overallPath.push(paths[0]);
                _this.get('store').query('taxonomy', { filter: { parent_ids: paths[1].id }, page: { size: 100 } }).then(results => {
                    Ember.set(paths[1], 'children', results.map(
                        function(result) { return { name: result.get('text'), id: result.id }; }
                    ));
                    overallPath.push(paths[1]);
                    _this.set('filteredPath', overallPath);
                });
            });
        }
    },
    filteredPath: Ember.computed('path', function() {
        this.updateFilteredPath();
    }),
    sortedTaxonomies: Ember.computed('taxonomies', function() {
        var _this = this; // TODO: Unnecessary
        this.get('store').query('taxonomy', { filter: { parent_ids: 'null' }, page: { size: 100 } }).then(results => {
            _this.set('sortedTaxonomies', results.map(function (result) {
                return {
                    name: result.get('text'),
                    id: result.get('id')
                };
            }));
        });
    }),
    path: [],
    /*
    * selected takes the format of: { taxonomy: { category: { subject: {}, subject2: {}}, category2: {}}}
    * in other words, each key is the name of one of the taxonomies, and each value is an object
    * containing child values.
    */
    selected: new Ember.Object(),
    /*
    * sortedSelection takes the format of: [['taxonomy', 'category', 'subject'], ['taxonomy'...]]
    * in other words, a 2D array
    */
    sortedSelection: Ember.computed('selected', function() {
        const sorted = [];
        const selected = this.get('selected');
        const flatten = ([obj, name = []]) => {
            const keys = Object.keys(obj);
            if (keys.length === 0) {
                return name.length !== 0 && sorted.pushObject(name);
            } else {
                return keys.sort()
                .map(key => [obj.get(key), [...name, key]])
                .forEach(flatten);
            }
        };
        flatten([selected]);
        return sorted;
    }),

    actions: {
        // Open next panel
        next(currentPanelName) {
            this.get('panelActions').open(this.get(`_names.${this.get('_names').indexOf(currentPanelName) + 1}`));
        },

        error(error /*, transition */) {
            this.get('toast').error(error);
        },
        /*
        * Upload section
        */
        changeState(newState) {
            this.set('filePickerState', newState);
        },
        changeUploadState(newState) {
            this.set('uploadState', newState);
        },
        createProject() {
            this.get('store').createRecord('node', {
                title: this.get('nodeTitle'),
                category: 'project',
                public: false // TODO: should this be public now or later, when it is turned into a preprint?  Default to the least upsetting option.
            }).save().then(node => {
                this.get('userNodes').pushObject(node);
                this.set('selectedNode', node);
                this.send('startUpload');
            });
        },
        // Override NodeActionsMixin.addChild
        addChild() {
            this._super(`${this.get('selectedNode.title')} Preprint`, this.get('selectedNode.description')).then(child => {
                this.get('userNodes').pushObject(child);
                this.set('selectedNode', child);
                this.send('startUpload');
            });
        },
        // nextAction: {action} callback for the next action to perform.
        deleteProject(nextAction) {
            // TODO: Do we really want the upload page to have a deletion button at all??
            // TODO: delete the previously created model, not the currently selected model
            if (this.get('selectedNode')) {
                this.get('selectedNode').destroyRecord().then(() => {
                    this.get('toast').info('Project deleted');
                });
                this.set('selectedNode', null);
                // TODO: reset dropzone, since uploaded file has no project
            }
            nextAction();
        },
        startUpload() {
            // TODO: retrieve and save fileid from uploaded file
            // TODO: deal with more than 10 files?
            this.set('_url', `${this.get('selectedNode.files').findBy('name', 'osfstorage').get('links.upload')}?kind=file&name=${this.get('uploadFile.name')}`);

            // TODO: Do not rely on cached resolve handlers, or toast for uploading. No file, no preprint- enforce workflow.
            this.get('resolve')();
            this.get('toast').info('File will upload in the background.');
            this.send('next', this.get('_names.0'));
        },
        // Dropzone hooks
        preUpload(ignore, dropzone, file) {
            this.set('uploadFile', file);
            // FIXME: Do not cache a resolve handler this way. (controllers are singletons, etc etc etc)
            // FIXME: If not using as closure actions, this causes action to bubble up farther
            return new Ember.RSVP.Promise(resolve => this.set('resolve', resolve));
        },
        getUploadUrl() {
            return this.get('_url');
        },
        uploadSuccess() {
            // Dropzone provides an event that can be checked for the file data
            let fileData = JSON.parse(arguments[4].target.response);
            let fileID = fileData.data.id;  // The WB response is prefixed with provider name- best way to clean this up?
            let osfFileID = fileID.split('/')[1];

            // Fetch an OSF file record matching the WB record. This is a very hacky upload process!
            this.get('store').findRecord('file', osfFileID)
                .then((file) => this.set('selectedFile', file));

            this.set('selectedFile', 'dummy value'); // FIXME: Placeholder to test expansion validation
            this.get('toast').info('File uploaded!');
        },

        /*
          Basics section
         */
        saveBasics() {
            // Save the model associated with basics field, then advance to next panel
            // If save fails, do not transition
            let node = this.get('selectedNode');
            node.save()
                .then(() => this.send('next', this.get('_names.1')))
                .catch(()=> this.send('error', 'Could not save information; please try again'));
        },

        /*
        * Subject section
        */
        deleteSubject(key, array = key.split('.')) {
            // TODO: Taxonomies may go many levels deeper
            this.set(key, null);
            // Delete key manually
            switch (array.length) {
                case 2:
                    delete this[array[0]][array[1]];
                    break;
                case 3:
                    delete this[array[0]][array[1]][array[2]];
                    break;
                case 4:
                    delete this[array[0]][array[1]][array[2]][array[3]];
                    break;
                default:
                    console.error('deletion not implemented');
            }
        },
        deselectSubject([...args]) {
            args = args.filter(arg => Ember.typeOf(arg) === 'string');
            this.send('deleteSubject', `selected.${args.join('.')}`, ['selected', ...args]);
            this.notifyPropertyChange('selected');
            this.rerender();
        },
        selectSubject(...args) {
            const process = (prev, cur, i, arr) => {
                const selected = this.get(`selected.${prev}`);
                if (!selected) {
                    // Create necessary parent objects and newly selected object
                    this.set(`selected.${prev}`, new Ember.Object());
                } else if (i === 3 || i === args.length && args.length === this.get('path').length &&
                this.get('path').every((e, i) => e.name === args[i].name) &&
                Object.keys(selected).length === 0) {
                    // Deselecting a subject: if subject is last item in args,
                    // its children are showing, and no children are selected
                    this.send('deleteSubject', `selected.${prev}`, ['selected', ...arr.splice(0, i)]);
                    args.popObject();
                }
                return `${prev}.${cur}`;
            };
            // Process past length of array
            [...args.map(arg => arg.name || arg), ''].reduce(process);
            this.set('path', args);
            this.updateFilteredPath();
            this.notifyPropertyChange('selected');
            this.rerender();
        },

        saveSubjects() {
            // Update the temp preprint object with selected subjects, then advance. Nothing is actually saved here because preprint isn't created yet.
            //TODO implement: requires a datasource for IDs, not labels, of taxonomy items
            // If save fails, do not transition
            this.set('model.subjects', this.get('selected'));
            this.send('next', this.get('_names.2'));
        },
        /**
         * findContributors method.  Queries APIv2 users endpoint on full_name.  Fetches specified page of results.
         * TODO will eventually need to be changed to multifield query.
         *
         * @method findContributors
         * @param {String} query ID of user that will be a contributor on the node
         * @param {Integer} page Page number of results requested
         * @return {Record} Returns specified page of user records matching full_name query
         */
        findContributors(query, page) {
            return this.store.query('user', { filter: { full_name: query }, page: page }).then((contributors) => {
                this.set('searchResults', contributors);
                return contributors;
            }, () => {
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
                }, 4000);
            });
        },
        /*
          Submit tab actions
         */
        savePreprint() {
            // TODO: Check validation status of all sections before submitting
            // TODO: Make sure subjects is working so request doesn't get rejected
            // TODO: Test and get this code working
            let model = this.get('model');
            model.setProperties({
                id: this.get('selectedNode.id'),
                primaryFile: this.get('selectedFile')
            });
            model.save()
                .then(() => console.log('Save succeeded. Should we transition somewhere?'))
                .catch(() => this.send('error', 'Could not save preprint; please try again later'));
        }
    }
});
