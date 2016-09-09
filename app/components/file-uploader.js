import Ember from 'ember';
import {State} from '../controllers/submit';

/**
 * File uploader widget - handles all cases where uploading a new file as your preprint
 *
 *  Currently used for the following scenarios 1) Upload file to a new project 2) Upload file to a new component 3) Upload
 *  file to an existing node.
 *
 *  Contains dropzone-widget where you can drag and drop preprint file. "file" will be set to the preuploaded file. 'node' will
 *  either become the newly created project or component, or the existing node.  After file is uploaded to the designated "node",
 *  "osfFile" is set to the uploadedFile.  Any projects or files created here are appended to "projectsCreatedForPreprint" and
 *  "filesUploadedForPreprint" respectively.
 *
 * Sample usage:
 * ```handlebars
 * {{file-uploader
 *       changeState=changeState (action)
 *       finishUpload=finishUpload (action)
 *       uploadIntent='newNodeNewFile' (if new node, new file instance)
 *       startState=startState ('start')
 *       nodeTitle=nodeTitle
 *       currentUser=currentUser (current logged-in user)
 *       osfFile=selectedFile
 *       hasFile=hasFile
 *       file=file
 *       projectsCreatedForPreprint=projectsCreatedForPreprint
 *       filesUploadedForPreprint=filesUploadedForPreprint
 *       contributors=contributors (if need to copy contributors to new component)
 *       node=node
 *       selectedNode=selectedNode
 *       userNodes=userNodes
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
    nodeTitle: null,
    convertOrCopy: null, // Will either be 'convert' or 'copy' depending on whether user wants to use existing component or create a new component.

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
            if (this.get('uploadIntent') === 'newNodeNewFile') {
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
                public: false, // ?
                category: 'project',
                title: this.get('nodeTitle'),
            }).save().then(node => {
                this.set('node', node);
                this.send('upload');
                this.get('userNodes').pushObject(node);
                this.get('projectsCreatedForPreprint').pushObject(node);
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
                    this.get('userNodes').pushObject(child);
                    this.send('upload');
                    this.get('projectsCreatedForPreprint').pushObject(this.get('node'));
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
                this.set('hasFile', false);
                this.set('selectedFile', null);
                this.set('convertOrCopy', null);
                this.get('toast').error(
                    file.xhr.status === 409 ?
                    'A file with that name already exists'
                    : 'Upload Failed');
            }
        }
    }
});

