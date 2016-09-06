import Ember from 'ember';
import {State} from '../controllers/submit';

export default Ember.Component.extend({
    State,
    store: Ember.inject.service(),
    toast: Ember.inject.service(),

    url: null,
    node: null,
    callback: null,
    nodeTitle: null,
    createChild: false,
    convertOrCopy: null,

    dropzoneOptions: {
        maxFiles: 1,
        method: 'PUT',
        uploadMultiple: false,
    },
    titleValid: null,

    init() {
        this._super(...arguments);

        this.set('file', null);
        this.set('callback', null);
        this.set('nodeTitle', null);
        this.set('createChild', false);
    },

    actions: {
        getUrl() {
            return this.get('url');
        },

        upload() {
            return this.get('node.files').then(files => {
                this.set('url', files.findBy('name', 'osfstorage').get('links.upload') + '?' + Ember.$.param({
                    kind: 'file',
                    name: this.get('file.name'),
                }));

                this.callback.resolve(this.get('file'));
            });
        },

        setNodeAndFile() {
            if (this.get('uploadIntent') === 'newNodeNewFile') {
                this.send('createProjectAndUploadFile');
            } else if (this.get('convertOrCopy') === 'copy') {
                this.send('createComponentAndUploadFile');
            } else if (this.get('convertOrCopy') === 'convert') {
                this.send('uploadFileToExistingNode');
            }
        },

        createProjectAndUploadFile() {
            this.get('store').createRecord('node', {
                public: false, // ?
                category: 'project',
                title: this.get('nodeTitle'),
            }).save().then(node => {
                this.set('node', node);
                this.send('upload');
                this.get('projectsCreatedForPreprint').pushObject(node);
            });
        },

        createComponentAndUploadFile() {
            var parentNode = this.get('node');
            parentNode
                .addChild(this.get('nodeTitle'), this.get('node.description'))
                .then(child => {
                    this.set('node', child);
                    parentNode.get('contributors').toArray().forEach(contributor => {
                        if (this.get('currentUser').id !== contributor.get('userId')) {
                            this.get('node').addContributor(contributor.get('userId'), contributor.get('permission'), contributor.get('bibliographic')).then((contrib) => {
                                this.get('contributors').pushObject(contrib);
                            });
                        }
                    });
                    this.send('upload');
                    this.get('projectsCreatedForPreprint').pushObject(this.get('node'));
                });
        },

        uploadFileToExistingNode() {
            var node = this.get('node');
            if (node.get('title') !== this.get('nodeTitle')) {
                node.set('title', this.get('nodeTitle'));
                node.save().then(() => {
                    this.send('upload');
                });
            } else {
                this.send('upload');
            }
        },

        // Dropzone hooks
        sending(_, dropzone, file, xhr/* formData */) {
            let _send = xhr.send;
            xhr.send = function() {
                _send.call(xhr, file);
            };
            xhr.withCredentials = true;
        },
        preUpload(_, dropzone, file) {
            this.set('file', file);
            this.set('hasFile', true);
            this.set('callback', Ember.RSVP.defer());
            return this.get('callback.promise');
        },
        maxfilesexceeded(_, dropzone, file) {
            dropzone.removeAllFiles();
            dropzone.addFile(file);
        },
        complete(_, dropzone, file) {
            // Complete is called when swapping out files for some reason...
            if (file.xhr === undefined) return;

            if (Math.floor(file.xhr.status / 100) === 2) {
                // Success
                this.get('toast').info('Preprint uploaded!');

                let resp = JSON.parse(file.xhr.response);
                this.get('store')
                    .findRecord('file', resp.data.id.split('/')[1])
                    .then(file => {
                        this.set('osfFile', file);
                        this.get('filesUploadedForPreprint').push(file);
                        this.sendAction('finishUpload');
                    });
            } else {
                //Failure
                dropzone.removeAllFiles();
                this.get('toast').error(
                    file.xhr.status === 409 ?
                    'A file with that name already exists'
                    : 'Upload Failed');
            }
        }
    }
});

