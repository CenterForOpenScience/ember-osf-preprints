import Ember from 'ember';
import NodeActionsMixin from 'ember-osf/mixins/node-actions';
import permissions from 'ember-osf/const/permissions';

export default Ember.Controller.extend(NodeActionsMixin, {
    toast: Ember.inject.service(),
    _url: null,
    openModal: false,
    resolve: null,
    latestFileName: null,
    preprint: null,
    dropzoneOptions: {
        uploadMultiple: false,
        method: 'PUT'
    },
    canEdit: Ember.computed('isAdmin', 'isRegistration', function() {
        return this.get('isAdmin') && !(this.get('model').get('registration'));
    }),
    isAdmin: Ember.computed(function() {
        return this.get('model.currentUserPermissions').indexOf(permissions.ADMIN) >= 0;
    }),
    searchResults: [],
    actions: {
        preUpload(comp, drop, file) {
            this.set('latestFileName', file.name);
            return new Ember.RSVP.Promise(resolve => {
                this.set('resolve', resolve);
            });
        },
        // Save metadata in Jam
        // TODO: Check if this works with proper permissions (will get 401 if not set properly)
        success(ignore, dropzone, file, response) {
            let path = response.path.slice(1);
            let preprint = this.get('preprint');
            let preprintMetadata = this.get('store').createRecord('preprint', {
                    id: path, // TODO: change to guid
                    attributes: {
                        title: preprint.title,
                        abstract: preprint.abstract,
                        authors: preprint.authors,
                        date: new Date(),
                        subject: preprint.subject,
                        tags: preprint.tags,
                        journal: preprint.journal,
                        doi: preprint.doi,
                        path: path
                    }
                });

            preprintMetadata.save().then(() =>
                this.transitionToRoute('preprints', path)
            ).catch(error => {
                console.error(error);
                this.get('toast').error('Could not save preprint metadata!');
            });
        },
        error(ignore, dropzone, file, errorMessage) {
            console.error(errorMessage);
            this.get('toast').error(`Error uploading file:${errorMessage}`);
        },
        buildUrl() {
            return this.get('_url');
        },
        uploadNewPreprintToNewProject(title, abstract, authors, subject, tags, journal, doi) {
            //Create new public project
            let node = this.get('store').createRecord('node', {
                title: title,
                category: 'project',
                description: abstract || null,
                public: true
            });

            this.set('preprint', {
                title: title,
                abstract: abstract,
                authors: authors,
                subject: subject,
                tags: tags,
                journal: journal,
                doi: doi
            });

            // TODO: Add logic for if you're not uploading a file
            // Upload a new file to the new project
            node.save().then(() => {
                this.set('_url', `https://test-files.osf.io/file?path=/${this.get('latestFileName')}&nid=${node.id}&provider=osfstorage`);
                this.set('openModal', false);
                this.get('resolve')();
            }).catch(error => {
                console.error(error);
                this.get('toast').error('Could not create preprint project!');
            });
            //TODO: eventually make a call to set an OSF file as a preprint (will probably need a flag for such)
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
