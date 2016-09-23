import Ember from 'ember';
import {State} from '../controllers/submit';

/**
 * File uploader widget - handles all cases where uploading a new file as your preprint
 *
 *  Currently used for the following scenarios 1) Upload file to a new project 2) Upload file to a new component 3) Upload
 *  file to an existing node.
 *
 *  Contains dropzone-widget where you can drag and drop preprint file. 'file' will be set to the preuploaded file. 'node' will
 *  either become the newly created project or component, or the existing node.  After file is uploaded to the designated 'node',
 *  'osfFile' is set to the uploadedFile.
 *
 * Sample usage:
 * ```handlebars
 * {{file-uploader
 *       changeInitialState=changeInitialState (action)
 *       finishUpload=finishUpload (action)
 *       newNodeNewFile=true (if new node, new file instance)
 *       startState=startState ('start')
 *       nodeTitle=nodeTitle
 *       currentUser=currentUser (current logged-in user)
 *       osfFile=selectedFile
 *       hasFile=hasFile
 *       file=file
 *       contributors=contributors (if need to copy contributors to new component)
 *       node=node
 *       selectedNode=selectedNode
 *       convertOrCopy=convertOrCopy
 *       parentNode=parentNode
 *       convertProjectConfirmed=convertProjectConfirmed
 *}}
 * ```
 * @class file-uploader
 */
export default Ember.Component.extend({
    State,
    store: Ember.inject.service(),
    toast: Ember.inject.service(),

    url: null,
    node: null,
    callback: null,
    uploadInProgress: false,

    dropzoneOptions: {
        maxFiles: 1,
        method: 'PUT',
        uploadMultiple: false,
    },
    titleValid: null,

    init() {
        this._super(...arguments);
        this.attrs.clearDownstreamFields('belowNode');
        this.set('callback', null);
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
            // Switches between various upload scenarios involving uploading file to 1) a new project 2) a new component 3) an existing node.
            this.set('uploadInProgress', true);
            if (this.get('newNodeNewFile')) {
                this.send('createProjectAndUploadFile');
            } else if (this.get('convertOrCopy') === 'copy') {
                this.send('createComponentAndUploadFile');
            } else if (this.get('convertOrCopy') === 'convert') {
                this.send('uploadFileToExistingNode');
            }
        },

        createProjectAndUploadFile() {
            // Upload case where user starting from scratch - new project/new file.  Creates project and then uploads file to newly
            // created project
            this.get('store').createRecord('node', {
                public: false,
                category: 'project',
                title: this.get('nodeTitle'),
            }).save().then(node => {
                this.set('node', node);
                this.send('upload');
            });
        },

        createComponentAndUploadFile() {
            // Upload case for using a new component and a new file for the preprint.  Creates component of parent node
            // and then uploads file to newly created component.
            var node = this.get('node');
            node
                .addChild(this.get('nodeTitle'))
                .then(child => {
                    this.set('parentNode', node);
                    this.set('node', child);
                    this.send('upload');
                });
        },

        uploadFileToExistingNode() {
            // Upload case for using an existing node with a new file for the preprint.  Updates title of existing node and then uploads file to node.
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
            this.send('formatDropzoneAfterPreUpload');
            this.attrs.clearDownstreamFields('belowFile');
            this.set('file', file);
            this.set('hasFile', true);
            this.set('callback', Ember.RSVP.defer());
            // Delays so user can see that file has been preuploaded before
            // advancing to next panel
            Ember.run.later(() => {
                this.attrs.nextUploadSection('uploadNewFile', 'organize');
            }, 1500);
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
                        this.sendAction('finishUpload');
                    });
            } else {
                //Failure
                dropzone.removeAllFiles();
                // Error uploading file. Clear downstream fields.
                this.attrs.clearDownstreamFields('belowNode');
                this.get('toast').error(
                    file.xhr.status === 409 ?
                    'A file with that name already exists'
                    : 'Upload Failed');
            }
        },
        formatDropzoneAfterPreUpload() {
            this.$('.dz-default.dz-message').before(this.$('.dz-preview.dz-file-preview'));
            this.$('.dz-message span').contents().replaceWith('Click or drag another preprint file to replace');
            this.$('.dropzone').addClass('successHighlightGreenGray');

            setTimeout(() => {
                this.$('.dropzone').removeClass('successHighlightGreenGray');
            }, 1000);
        }
    }
});

