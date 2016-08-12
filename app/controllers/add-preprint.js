import Ember from 'ember';
import loadAll from 'ember-osf/utils/load-relationship';
import NodeActionsMixin from 'ember-osf/mixins/node-actions';

// Enum of available upload states
export const State = Object.freeze(new Ember.Object({
    START: 'start',
    NEW: 'new',
    EXISTING: 'existing'
}));

export default Ember.Controller.extend(NodeActionsMixin, {
    toast: Ember.inject.service(),
    session: Ember.inject.service(),
    panelActions: Ember.inject.service(),
    currentUser: Ember.inject.service(),
    fileManager: Ember.inject.service(),

    // Upload variables
    _State: State,
    state: State.START,
    uploadState: State.START,
    uploadFile: null,
    resolve: null,
    model: null,         // Node to transform into preprint
    shouldCreateChild: false,
    user: null,
    userNodes: Ember.A([]),
    dropzoneOptions: {
        uploadMultiple: false,
        method: 'PUT'
    },

    _names: ['upload', 'basics', 'subjects', 'authors', 'submit'].map(str => str.capitalize()),
    init() {
        this._super(...arguments);
        if (this.get('session.isAuthenticated')) {
            this._setCurrentUser();
        }
    },

    /*
     * Retrieving userNodes
     */
    _setCurrentUser() {
        this.get('currentUser').load().then(user => this.set('user', user));
    },
    _refreshNodes() {
        const user = this.get('user');
        if (user) {
            loadAll(user, 'nodes', this.get('userNodes'));
        } else {
            this.set('userNodes', Ember.A());
        }
    },
    onGetCurrentUser: Ember.observer('user', function() {
        this._refreshNodes();
    }),

    /*
     * Subjects section
     */
    filter: [{/* value: 'filterQuery' */}, {}, {}],
    filteredPath: Ember.computed('path', 'filter', 'filter.@each.value', function() {
        return this.get('path').slice(0, 2).map((path, i) => {
            if (path.children && this.get(`filter.${i + 1}.value`)) {
                return {
                    name: path.name,
                    children: path.children.filter(child =>
                        this.get(`filter.${i + 1}.value`).indexOf(child.name || child) !== -1)
                };
            }
            return path;
        });
    }),
    sortedTaxonomies: Ember.computed('taxonomies', 'filter', 'filter.0.value', function() {
        // Format of data that is expected in the hbs
        return [{
            name: 'a',
            children: [{
                name: 'b',
                children: ['c', 'd', 'e']
            }, {
                name: 'f',
                children: ['g']
            }],
        }, {
            name: 'h',
            children: [{
                name: 'i',
                children: ['j', 'k']
            }]
        }, {
            name: 'l'
        }].filter(taxonomy =>
            !this.get('filter.0.value') || taxonomy.name.indexOf(this.get('filter.0.value')) !== -1
        );
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
            this.set('state', newState);
        },
        changeUploadState(newState) {
            this.set('uploadState', newState);
        },
        createProject() {
            this.get('store').createRecord('node', {
                title: this.get('nodeTitle'),
                category: 'project',
                public: true // TODO: should this be public now or later, when it is turned into a preprint?
            }).save().then(node => {
                this.set('model', node);
                this._refreshNodes();
                this.send('startUpload');
            });
        },
        // Override NodeActionsMixin.addChild
        addChild() {
            this._super(`${this.get('model.title')} Preprint`, this.get('model.description')).then(child => {
                this.set('model', child);
                this._refreshNodes();
                this.send('startUpload');
            });
        },
        // nextAction: {action} callback for the next action to perform.
        deleteProject(nextAction) {
            // TODO: delete the previously created model, not the currently selected model
            if (this.get('model')) {
                this.get('model').destroyRecord().then(() => {
                    this.get('toast').info('Project deleted');
                });
                this.set('model', null);
                // TODO: reset dropzone, since uploaded file has no project
            }
            nextAction();
        },
        startUpload() {
            // TODO: retrieve and save fileid from uploaded file
            this.set('_url', `${this.get('model.files').findBy('name', 'osfstorage').get('links.upload')}?kind=file&name=${this.get('uploadFile.name')}`);
            this.get('resolve')();
            this.get('toast').info('File will upload in the background.');
            this.send('next', this.get('_names.0'));
        },
        // Dropzone hooks
        preUpload(ignore, dropzone, file) {
            this.set('uploadFile', file);
            return new Ember.RSVP.Promise(resolve => this.set('resolve', resolve));
        },
        buildUrl() {
            return this.get('_url');
        },
        success() {
            this.get('toast').info('File uploaded!');
        },
        /*
         * Subject section
         */
        deleteSubject(key, array = key.split('.')) {
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
        deselectSubject(args) {
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
                    // Deselecting a subject: if subject is last item in args, path matches previous path,
                    // its children are showing, and no children are selected
                    this.send('deleteSubject', `selected.${prev}`, ['selected', ...arr.splice(0, i)]);
                    args.popObject();
                }
                return `${prev}.${cur}`;
            };
            // Process past length of array
            [...args.map(arg => arg.name || arg), ''].reduce(process);
            this.set('path', args);
            this.notifyPropertyChange('selected');
            this.rerender();
        }
    }
});
