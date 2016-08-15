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

// preprint form basic validations
const Validations = buildValidations({
    title: {
        description: 'Title',
        validators: [
            validator('presence', true),
            validator('length', {
                // minimum length for title?
                max: 200,
            })
        ]
    },
    abstract: {
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
    doi: {
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

export default Ember.Controller.extend(Validations, NodeActionsMixin, {
    toast: Ember.inject.service('toast'),
    panelActions: Ember.inject.service('panelActions'),

    // Data tracked internally
    user: null,
    node: null,
    userNodes: Ember.A(),
    contributors: Ember.A(),

    getContributors: Ember.observer('node', function() {
        let node = this.get('node');
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

    isAdmin: Ember.computed('node', function() {
        // FIXME: Workaround for isAdmin variable not making sense until a node has been loaded
        let userPermissions = this.get('node.currentUserPermissions') || [];
        return userPermissions.indexOf(permissions.ADMIN) >= 0;
    }),

    canEdit: Ember.computed('isAdmin', 'node', function() {
        return this.get('isAdmin') && !(this.get('node.registration'));
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
        var _this = this;
        this.get('store').query('taxonomy', { filter: { parent_ids: 'null' }, page: { size: 100 } }).then(results => {
            _this.set('sortedTaxonomies', results.map((result) => {
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
        next(name) {
            this.get('panelActions').open(this.get(`_names.${this.get('_names').indexOf(name) + 1}`));
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
                this.set('node', node);
                this.send('startUpload');
            });
        },
        // Override NodeActionsMixin.addChild
        addChild() {
            this._super(`${this.get('node.title')} Preprint`, this.get('node.description')).then(child => {
                this.get('userNodes').pushObject(child);
                this.set('node', child);
                this.send('startUpload');
            });
        },
        // nextAction: {action} callback for the next action to perform.
        deleteProject(nextAction) {
            // TODO: Do we really want the upload page to have a deletion button at all??
            // TODO: delete the previously created model, not the currently selected model
            if (this.get('node')) {
                this.get('node').destroyRecord().then(() => {
                    this.get('toast').info('Project deleted');
                });
                this.set('node', null);
                // TODO: reset dropzone, since uploaded file has no project
            }
            nextAction();
        },
        startUpload() {
            // TODO: retrieve and save fileid from uploaded file
            // TODO: deal with more than 10 files?
            this.set('_url', `${this.get('node.files').findBy('name', 'osfstorage').get('links.upload')}?kind=file&name=${this.get('uploadFile.name')}`);

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
        success() {
            this.get('toast').info('File uploaded!');
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
            });
        }
    }
});
