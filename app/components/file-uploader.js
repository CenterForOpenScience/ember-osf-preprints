import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';
import { defer } from 'rsvp';
import $ from 'jquery';
import Analytics from 'ember-osf/mixins/analytics';
import { State } from '../controllers/submit';
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * File uploader widget
 *
 *  Handles all cases where uploading a new file as your preprint,
 *  or uploading a new version of your preprint.
 *
 *  Currently used for the following ADD mode scenarios:
 *  1) Upload file to a new project
 *  2) Upload file to a new component
 *  3) Upload file to an existing node.
 *  Also used in EDIT mode because your only option to change a preprint file is
 *  to upload a new version.
 *
 *  Contains dropzone-widget where you can drag and drop preprint file.
 *  'file' will be set to the preuploaded file. 'node' will either become the newly created project
 *  or component, or the existing node.  After file is uploaded to the designated 'node',
 *  'osfFile' is set to the uploadedFile.
 *
 *  NOTE: file-uploader is used in two places in the preprints application:
 *  on the submit page and inside the preprint-form-project-select component.
 *  If new properties need to be passed to this component, be sure to update in both places.
 *
 * ```handlebars
 * {{file-uploader
 *   changeInitialState=(action 'changeInitialState')
 *   nextUploadSection=nextUploadSection
 *   finishUpload=(action 'finishUpload')
 *   clearDownstreamFields=(action 'clearDownstreamFields')
 *   nextUploadSection=(action 'nextUploadSection')
 *   discardUploadChanges=(action 'discardUploadChanges')
 *   newPreprintFile=true
 *   startState=_State.START
 *   existingState=existingState
 *   _existingState=_existingState
 *   title=title
 *   currentUser=user
 *   osfFile=selectedFile
 *   hasFile=hasFile
 *   file=file
 *   node=node
 *   nodeLocked=nodeLocked
 *   titleValid=titleValid
 *   uploadChanged=uploadChanged
 *   uploadInProgress=uploadInProgress
 *   basicsAbstract=basicsAbstract
 *   editMode=editMode
 *   newNode=newNode
 *   applyLicense=applyLicense
}}
 * @class file-uploader
 */
export default Component.extend(Analytics, {
    i18n: service(),
    store: service(),
    toast: service(),
    panelActions: service('panelActions'),
    model: null,

    State,
    url: null,
    node: null,
    callback: null,
    currentPreprintTitle: null,
    /* eslint-disable-next-line ember/avoid-leaking-state-in-components */
    dropzoneOptions: {
        maxFiles: 1,
        method: 'PUT',
        uploadMultiple: false,
        autoDiscover: false,
    },

    fileVersion: computed('osfFile', function() {
        // Helps communicate to user that there may be a pending, unsaved version
        return this.get('osfFile.currentVersion') || 1;
    }),
    init() {
        this._super(...arguments);
        this.set('callback', null);
    },

    actions: {
        toggleIsOpen(panelName) {
            if (this.get('editMode')) {
                if (this.get('currentPanelName')) {
                    this.get('panelActions').close(this.get('currentPanelName'));
                }
                this.get('metrics')
                    .trackEvent({
                        category: 'div',
                        action: 'click',
                        label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Click to edit, ${this.panelName} section`,
                    });
                this.get('panelActions').open(panelName);
                this.set('currentPanelName', panelName);
            }
        },

        getUrl() {
            return this.get('url');
        },

        uploadNewFileUrl(files) {
            // Add mode - creates url for uploading a new file
            this.set('url', `${files.findBy('name', 'osfstorage').get('links.upload')}?${$.param({
                kind: 'file',
                name: this.get('file.name'),
            })}`);
        },

        uploadNewVersionUrl(files) {
            // Edit mode - creates url for uploading a new version of a file
            this.set('url', `${files.findBy('name', 'osfstorage').get('links.upload') + this.get('osfFile.id')}?${$.param({
                kind: 'file',
            })}`);
        },

        upload() {
            // Uploads file to node
            if (this.get('file') === null) { // No new file to upload.
                this.finishUpload();
            } else {
                return this.get('node.files').then(this._setUploadProperties.bind(this));
            }
        },

        uploadToPreprint() {
            // Uploads file to preprint
            if (this.get('file') === null) { // No new file to upload.
                this.finishUpload();
            } else {
                return this.get('model.files').then(this._setUploadProperties.bind(this));
            }
        },

        createPreprintAndUploadFile() {
            this.set('uploadInProgress', true);
            const preprint = this.get('model');
            preprint.set('title', this.get('title'));
            preprint.set('provider', this.get('provider'));
            preprint.save()
                .then(this._createNewPreprint.bind(this))
                .catch(this._failCreateNewPreprint.bind(this));
        },

        createProjectAndUploadFile() {
            // Upload case where user starting from scratch - new project/new file.
            // Creates project and then uploads file to newly created project
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Submit - Save and Continue, New Node New File',
                });
            this.get('store').createRecord('node', {
                public: false,
                category: 'project',
                title: this.get('title'),
            }).save()
                .then(this._createNewProject.bind(this))
                .catch(this._failCreateNewProject.bind(this));
        },

        uploadNewPreprintVersion() {
            // Upload case for using an existing node with a new file for the preprint.
            // Updates title of existing node and then uploads file to node.
            // Also applicable in edit mode.
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Save and Continue, ${this.get('nodeLocked') ? 'Save File/Title Edits' : 'Existing Node New File'}`,
                });
            if (this.get('nodeLocked')) { // Edit mode
                this.set('uploadInProgress', true);
            }

            const model = this.get('model');
            this.set('basicsAbstract', this.get('model.description') || null);
            const currentPreprintTitle = model.get('title');

            if (currentPreprintTitle !== this.get('title')) {
                model.set('title', this.get('title'));
                model.save()
                    .then(this._sendToUploadPreprint.bind(this))
                    .catch(this._failUpdateTitle.bind(this));
            } else {
                this.send('uploadToPreprint');
            }
        },

        // Dropzone hooks
        sending(_, dropzone, file, xhr/* formData */) {
            const _send = xhr.send;
            /* eslint-disable-next-line no-param-reassign */
            xhr.send = function() {
                _send.call(xhr, file);
            };
            /* eslint-disable-next-line no-param-reassign */
            xhr.withCredentials = true;
        },
        mustModifyCurrentPreprintFile() {
            // Can only upload a new version of a preprint file once the preprint has been created.
            this.get('toast').error(this.get('i18n').t(
                'components.file-uploader.version_error',
                {
                    documentType: this.get('provider.documentType'),
                },
            ));
            this.send('formatDropzoneAfterPreUpload', false);
            this.set('file', null);
            this.set('fileVersion', this.get('osfFile.currentVersion'));
            if (window.Dropzone) window.Dropzone.forElement('.dropzone').removeAllFiles(true);
        },
        setPreUploadedFileAttributes(file, version) {
            // Sets preUploadedFile attributes.
            this.send('formatDropzoneAfterPreUpload', true);
            this.set('file', file);
            this.set('fileVersion', version);
        },
        preUpload(_, dropzone, file) {
            // preUpload or "stage" file. Has yet to be uploaded to node.
            this.set('uploadInProgress', false);
            if (this.get('nodeLocked')) { // Edit mode
                if (file.name !== this.get('osfFile.name')) { // Invalid File - throw error.
                    this.send('mustModifyCurrentPreprintFile');
                } else { // Valid file - can be staged.
                    this.send('setPreUploadedFileAttributes', file, this.get('osfFile.currentVersion') + 1);
                }
            } else { // Add mode
                this.attrs.clearDownstreamFields('belowFile');
                this.send('setPreUploadedFileAttributes', file, this.get('osfFile.currentVersion'));
            }
            this.send('preUploadMetrics');
            this.set('callback', defer());
            // Delays so user can see that file has been preuploaded before
            // advancing to next panel
            later(() => {
                this.attrs.nextUploadSection('uploadNewFile', 'finalizeUpload');
            }, 1500);
            return this.get('callback.promise');
        },
        discardUploadChanges() {
            // Discards file upload changes.  Removes staged files from Dropzone,
            // reverts visible file version.
            if (window.Dropzone) window.Dropzone.forElement('.dropzone').removeAllFiles(true);
            this.set('fileVersion', this.get('osfFile.currentVersion') || 1);
            this.attrs.discardUploadChanges();
        },
        maxfilesexceeded(_, dropzone, file) {
            dropzone.removeAllFiles();
            dropzone.addFile(file);
        },
        complete(_, dropzone, file) {
            // Called after uploading file to node is complete. After file has been uploaded,
            // makes a request to create the preprint.

            // Complete is called when swapping out files for some reason...
            if (file.xhr === undefined) return;

            if (Math.floor(file.xhr.status / 100) === 2) {
                // File upload success
                const resp = JSON.parse(file.xhr.response);
                /* eslint-disable ember/closure-actions,ember/named-functions-in-promises */
                this.get('store')
                    .findRecord('file', resp.data.id.split('/')[1])
                    .then((file) => {
                        this.set('osfFile', file);
                        // Set current version:
                        // will revert if user uploaded a new version of the same file
                        this.set('fileVersion', resp.data.attributes.extra.version);
                        if (this.get('nodeLocked')) { // Edit mode
                            if (this.get('osfFile.currentVersion') !== resp.data.attributes.extra.version) {
                                this.get('toast').info(this.get('i18n').t(
                                    'components.file-uploader.preprint_file_updated',
                                    {
                                        documentType: this.get('provider.documentType'),
                                    },
                                ));
                                this.sendAction('startPreprint');
                            }
                            if (window.Dropzone) window.Dropzone.forElement('.dropzone').removeAllFiles(true);
                        } else { // Add mode
                            return this.sendAction('startPreprint');
                        }
                    })
                    .catch(() => {
                        this.get('toast').error(this.get('i18n').t(
                            'components.file-uploader.preprint_file_error',
                            {
                                documentType: this.get('provider.documentType'),
                            },
                        ));
                        this.set('uploadInProgress', false);
                    });
                /* eslint-enable ember/closure-actions,ember/named-functions-in-promises */
            } else {
                // File upload failure
                dropzone.removeAllFiles();
                this.set('file', null);
                // Error uploading file. Clear downstream fields.
                this.attrs.clearDownstreamFields('belowNode');
                this.set('uploadInProgress', false);
                this.get('toast').error(file.xhr.status === 409 ?
                    this.get('i18n').t('components.file-uploader.file_exists_error')
                    : this.get('i18n').t('components.file-uploader.upload_error'));
            }
        },
        formatDropzoneAfterPreUpload(success) {
            // Replaces dropzone message, highlights green or red, depending on preupload success.
            if (success) {
                this.$('.dz-default.dz-message').before(this.$('.dz-preview.dz-file-preview'));
                this.$('.dz-message span').contents().replaceWith(this.get('i18n').t(
                    'components.file-uploader.dropzone_text_override',
                    {
                        documentType: this.get('provider.documentType'),
                    },
                ).string);
                this.$('.dropzone').addClass('successHighlightGreenGray');

                setTimeout(() => {
                    this.$('.dropzone').removeClass('successHighlightGreenGray');
                }, 1000);
            } else {
                this.$('.dropzone').addClass('errorHighlight');

                setTimeout(() => {
                    this.$('.dropzone').removeClass('errorHighlight');
                }, 1000);
            }
        },
        preUploadMetrics() {
            const eventData = {
                category: 'dropzone',
                action: 'drop',
            };

            if (this.get('newPreprintFile')) {
                eventData.label = 'Submit - Drop File, New Node';
            } else if (this.get('nodeLocked')) {
                eventData.label = `${this.get('editMode') ? 'Edit' : 'Submit'} - Drop File, New Version`;
            } else {
                eventData.label = 'Submit - Drop File, Existing Node';
            }
            this.get('metrics')
                .trackEvent(eventData);
        },
    },

    _setUploadProperties(files) {
        if (this.get('nodeLocked')) { // Edit mode, fetch URL for uploading new version
            this.send('uploadNewVersionUrl', files);
        } else { // Add mode, fetch URL for uploading new file
            this.send('uploadNewFileUrl', files);
        }
        this.callback.resolve(this.get('file'));
    },

    _createNewProject(node) {
        this.set('node', node);
        this.getProjectContributors(node);
        this.send('upload');
        this.set('newNode', true);
        this.set('applyLicense', true);
    },

    _createNewPreprint() {
        this.send('uploadToPreprint');
    },

    _failCreateNewPreprint() {
        this.set('uploadInProgress', false);
        this.get('toast').error(this.get('i18n').t('components.file-uploader.could_not_create_preprint'));
    },

    _failCreateNewProject() {
        this.set('uploadInProgress', false);
        this.get('toast').error(this.get('i18n').t('components.file-uploader.could_not_create_project'));
    },

    _sendToUpload() {
        this.send('upload');
    },

    _sendToUploadPreprint() {
        this.send('uploadToPreprint');
    },

    _failUpdateTitle() {
        const preprint = this.get('preprint');
        const currentPreprintTitle = this.get('currentPreprintTitle');

        preprint.set('title', currentPreprintTitle);
        this.set('uploadInProgress', false);
        this.get('toast').error(this.get('i18n').t('components.file-uploader.could_not_update_title'));
    },

    _failUploadFile() {
        this.get('toast').error(this.get('i18n').t('components.file-uploader.preprint_file_error'));
        this.set('uploadInProgress', false);
    },
});
