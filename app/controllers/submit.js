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
    fileManager: Ember.inject.service(),
    toast: Ember.inject.service('toast'),
    panelActions: Ember.inject.service('panelActions'),
    _names: ['upload', 'discipline', 'basics', 'authors', 'submit'].map(str => str.capitalize()),

    // Data for project picker; tracked internally on load
    user: null,
    userNodes: Ember.A(),

    // Information about the thing to be turned into a preprint
    node: null,
    file: null,
    selectedFile: null,
    contributors: Ember.A(),
    uploadFile: null,
    nodeTitle: null,
    shouldCreateChild: false,
    fileAndNodeLocked: false,
    projectsCreatedForPreprint:  Ember.A(),
    filesUploadedForPreprint: Ember.A(),
    searchResults: [],
    savingPreprint: false,
    showModalSharePreprint: false,
    showModalRestartPreprint: false,
    uploadSaveState: false,
    basicsSaveState: false,
    authorsSaveState: false,
    disciplineSaveState: false,

    clearFields() {
        this.get('panelActions').open('Upload');
        this.get('panelActions').close('Submit');

        this.setProperties(Ember.merge(
            this.get('_names').reduce((acc, name) => Ember.merge(acc, {[`${name.toLowerCase()}SaveState`]: false}), {}), {
            user: null,
            userNodes: Ember.A(),
            node: null,
            file: null,
            selectedFile: null,
            contributors: Ember.A(),
            uploadFile: null,
            nodeTitle: null,
            shouldCreateChild: false,
            fileAndNodeLocked: false,
            projectsCreatedForPreprint:  Ember.A(),
            filesUploadedForPreprint: Ember.A(),
            searchResults: [],
            savingPreprint: false,
            showModalSharePreprint: false,
            showModalRestartPreprint: false,
            uploadSaveState: false,
            basicsSaveState: false,
            authorsSaveState: false,
            disciplineSaveState: false,
        }));
    },

    hasFile: function() {
        return this.get('file') != null;
    }.property('file'),

    ///////////////////////////////////////
    // Validation rules for form sections
    uploadValid: Ember.computed.and('node', 'selectedFile', 'nodeTitle'),
    abstractValid: Ember.computed.alias('validations.attrs.basicsAbstract.isValid'),
    doiValid: Ember.computed.alias('validations.attrs.basicsDOI.isValid'),
    // Basics fields are currently the only ones with validation. Make this more specific in the future if we add more form fields.
    basicsValid: Ember.computed.and('abstractValid', 'doiValid'),
    // Must have at least one contributor. Backend enforces admin and bibliographic rules. If this form section is ever invalid, something has gone horribly wrong.
    authorsValid: Ember.computed.bool('contributors.length'),
    // Must select at least one subject.
    disciplineValid: Ember.computed.notEmpty('model.subjects'),
    allSectionsValid: Ember.computed('uploadValid', 'basicsValid', 'authorsValid', 'disciplineValid', function() {
        return this.get('uploadValid') && this.get('basicsValid') && this.get('authorsValid') && this.get('disciplineValid');
    }),

    ////////////////////////////////////////////////////
    // Fields used in the "basics" section of the form.
    // Proxy for "basics" section, to support autosave when fields change (created when model selected)
    basicsModel: Ember.computed.alias('node'),

    basicsTitle: Ember.computed.alias('basicsModel.title'),
    basicsAbstract: Ember.computed.alias('basicsModel.description'),
    basicsTags: Ember.computed.alias('basicsModel.tags'), // TODO: This may need to provide a default value (list)? Via default or field transform?
    basicsDOI: Ember.computed.alias('model.doi'),


    //// TODO: Turn off autosave functionality for now. Direct 2-way binding was causing a fight between autosave and revalidation, so autosave never fired. Fixme.
    // createAutosave: Ember.observer('node', function() {
    //     // Create autosave proxy only when a node has been loaded.
    //     // TODO: This could go badly if a request is in flight when trying to destroy the proxy
    //
    //     var controller = this;
    //     this.set('basicsModel', autosave('node', {
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

    getContributors: Ember.observer('node', function() {
        // Cannot be called until a project has been selected!
        if (!this.get('node')) return [];

        let node = this.get('node');
        let contributors = Ember.A();
        loadAll(node, 'contributors', contributors).then(()=>
             this.set('contributors', contributors));
    }),

    isAdmin: Ember.computed('node', function() {
        // FIXME: Workaround for isAdmin variable not making sense until a node has been loaded
        let userPermissions = this.get('node.currentUserPermissions') || [];
        return userPermissions.indexOf(permissions.ADMIN) >= 0;
    }),

    canEdit: Ember.computed('isAdmin', 'node', function() {
        return this.get('isAdmin') && !(this.get('node.registration'));
    }),


    actions: {
        // Open next panel
        next(currentPanelName) {
            this.get('panelActions').open(this.get(`_names.${this.get('_names').indexOf(currentPanelName) + 1}`));
            this.send('changesSaved', currentPanelName);
        },
        changesSaved(currentPanelName) {
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
        lockFileAndNode() {
            this.set('fileAndNodeLocked', true);
        },
        finishUpload() {
            this.send('lockFileAndNode');
            this.send('next', this.get('_names.0'));
        },
        toggleRestartPreprintModal() {
            this.toggleProperty('showModalRestartPreprint');
        },
        resetFileUpload() {
            var promisesArray = [];
            var filePromises = [];
            this.get('filesUploadedForPreprint').forEach((file) => {
                filePromises.push(this.get('fileManager').deleteFile(file).then(() => {
                    this.get('toast').info('Preprint removed!');
                }).catch(() => {
                    this.get('toast').error('Could not remove uploaded preprint');
                }));
            });

            Ember.RSVP.allSettled(filePromises).then(() => {
                this.get('projectsCreatedForPreprint').forEach((project) => {
                    promisesArray.push(project.destroyRecord());
                });
            });

            Ember.RSVP.allSettled(promisesArray).then(() => {
                if (promisesArray.length > 0 || filePromises.length > 0) {
                    window.setTimeout(
                        function () {
                            location.reload();
                        }, 3000);
                } else {
                    window.location.reload();
                }
            });
        },
        editTitleNext(section) {
            this.set('node.title', this.get('nodeTitle'));
            let node = this.get('node');
            node.save();
            this.send('next', section);

        },

        /*
          Basics section
         */
        saveBasics() {
            // Save the model associated with basics field, then advance to next panel
            // If save fails, do not transition
            let node = this.get('node');
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
                    _this.$('#' + elementId).addClass('restoreWhiteBackground');

                }, 2000);
                setTimeout(() => {
                    _this.$('#' + elementId).removeClass(highlightClass);
                    _this.$('#' + elementId).removeClass('restoreWhiteBackground');
                }, 4000);
            });
        },
        /*
          Submit tab actions
         */
        toggleSharePreprintModal() {
            this.toggleProperty('showModalSharePreprint');
        },
        savePreprint() {
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

