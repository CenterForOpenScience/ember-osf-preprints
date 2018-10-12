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
 *  Handles file uploads to preprints - Allows you to upload a new file as your preprint,
 *  or upload a new version of your preprint
 *
 *  Contains dropzone-widget where you can drag and drop preprint file.
 *  'file' will be set to the preuploaded file. After file is uploaded to the designated 'model',
 *  'osfFile' is set to the uploadedFile.
 *
 * ```handlebars
 * {{file-uploader
 *   changeInitialState=(action 'changeInitialState')
 *   finishUpload=(action 'finishUpload')
 *   clearDownstreamFields=(action 'clearDownstreamFields')
 *   nextUploadSection=(action 'nextUploadSection')
 *   setPrimaryFile=(action 'setPrimaryFile')
 *   discardUploadChanges=(action 'discardUploadChanges')
 *   newPreprintFile=true
 *   startState=_State.START
 *   title=title
 *   currentUser=user
 *   osfFile=selectedFile
 *   hasFile=hasFile
 *   file=file
 *   model=model
 *   preprintLocked=preprintLocked
 *   titleValid=titleValid
 *   uploadChanged=uploadChanged
 *   uploadInProgress=uploadInProgress
 *   basicsAbstract=basicsAbstract
 *   editMode=editMode
 *   applyLicense=applyLicense
 *   provider=currentProvider
 *   uploadedFileId=uploadedFileId
 *   uploadedFileName=uploadedFileName
 *   currentState=currentState
}}
 * @class file-uploader
 */
export default Component.extend(Analytics, {
    i18n: service(),
    store: service(),
    toast: service(),
    fileManager: service(),
    panelActions: service('panelActions'),
    model: null,
    // If file added successfully (add mode), id saved here.  Used
    // for avoiding 409's
    uploadedFileId: null,
    // If file added successfully (add mode), file name saved here
    uploadedFileName: null,

    State,
    url: null,
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
            // Handles toggling within Preprint version section, once preprint is locked.
            // File panel manually opened since version-related panels are nested inside this.
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
            this.get('panelActions')._panelFor('File').set('apiOpenState', true);
            this.get('panelActions')._panelFor('File').set('apiWasUsed', true);
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

        uploadToPreprint() {
            // Uploads file to preprint
            if (this.get('file') === null) { // No new file to upload.
                this.attrs.finishUpload();
            } else if (this._uploadedFileUnchanged()) {
                // Add mode - file already uploaded to preprint
                this.send('fileUploadSuccess', this.get('uploadedFileId'), {});
            } else {
                return this.get('model.files').then(this._setUploadProperties.bind(this));
            }
        },

        createPreprintAndUploadFile() {
            // Run when "Save and continue" pressed on "Upload to your computer" section
            // Creates preprint on server with specified title and provider,
            // uploads file to preprint, and then sets preprint as primary file
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Submit - Save and Continue, Uploads New Preprint',
                });
            this.set('uploadInProgress', true);
            const preprint = this.get('model');
            preprint.set('title', this.get('title'));
            preprint.set('provider', this.get('provider'));
            preprint.save()
                .then(this._sendToUploadPreprint.bind(this))
                .catch(this._failCreateNewPreprint.bind(this));
        },

        uploadNewPreprintVersion() {
            // Updates title of existing preprint and then uploads new version to preprint.
            // Also applicable in edit mode.
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Save and Continue, ${this.get('preprintLocked') ? 'Save File/Title Edits' : 'Uploads New Version'}`,
                });
            this.set('uploadInProgress', true);

            const model = this.get('model');
            this.set('basicsAbstract', this.get('model.description') || null);
            this.set('currentPreprintTitle', this.get('model.title'));

            if (this.get('currentPreprintTitle') !== this.get('title')) {
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
            // preUpload or "stage" file. Has yet to be uploaded to preprint.
            this.set('uploadInProgress', false);
            if (this.get('preprintLocked')) { // Edit mode
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
        fileUploadSuccess(fileId, resp) {
            // Called after successful response returned from WB
            /* eslint-disable ember/closure-actions,ember/named-functions-in-promises */
            this.get('store')
                .findRecord('file', fileId)
                .then((file) => {
                    this.set('osfFile', file);
                    // Set current version:
                    // will revert if user uploaded a new version of the same file
                    if (this.get('preprintLocked')) { // Edit mode
                        this.set('fileVersion', resp.data.attributes.extra.version);
                        if (this.get('osfFile.currentVersion') !== resp.data.attributes.extra.version) {
                            this.get('toast').info(this.get('i18n').t(
                                'components.file-uploader.preprint_file_updated',
                                {
                                    documentType: this.get('provider.documentType'),
                                },
                            ));
                            this.sendAction('finishUpload');
                        }
                        if (window.Dropzone) window.Dropzone.forElement('.dropzone').removeAllFiles(true);
                        this.sendAction('finishUpload');
                    } else { // Add mode
                        return this.sendAction('setPrimaryFile');
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
        },
        complete(_, dropzone, file) {
            // Called after uploading file to a preprint is complete. After file has been uploaded,
            // to the preprint, makes a request to set that file as the primary file.

            // Complete is called when swapping out files for some reason...
            if (file.xhr === undefined) return;

            if (Math.floor(file.xhr.status / 100) === 2) {
                // Saves uploadedFileId and uploadedFile name in case of downstream error
                this.set('uploadedFileId', JSON.parse(file.xhr.response).data.id.split('/')[1]);
                this.set('uploadedFileName', JSON.parse(file.xhr.response).data.attributes.name);
                // File upload success
                const resp = JSON.parse(file.xhr.response);
                this.send('fileUploadSuccess', this.get('uploadedFileId'), resp);
            } else {
                // File upload failure
                dropzone.removeAllFiles();
                this.set('file', null);
                // Error uploading file. Clear downstream fields.
                this.set('uploadInProgress', false);
                this.get('toast').error(this.get('i18n').t('components.file-uploader.upload_error'));
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
                eventData.label = 'Submit - Drop File, New Preprint';
            } else if (this.get('preprintLocked')) {
                eventData.label = `${this.get('editMode') ? 'Edit' : 'Submit'} - Drop File, New Version`;
            }
            this.get('metrics')
                .trackEvent(eventData);
        },
    },

    _uploadedFileUnchanged() {
        // Returns true if a file of the same name was already uploaded successfully (Add mode),
        // but perhaps a request to the preprint failed. When attempting to retry the request,
        // we can pull this uploadedFileId to set as the preprint's primary file instead of
        // reuploading the file which would 409.
        if (this.get('preprintLocked')) {
            return false;
        }
        return this.get('uploadedFileId') && (this.get('file.name') === this.get('uploadedFileName'));
    },

    _setUploadProperties(files) {
        if (this.get('preprintLocked')) { // Edit mode, fetch URL for uploading new version
            this.send('uploadNewVersionUrl', files);
        } else { // Add mode, fetch URL for uploading new file
            this.send('uploadNewFileUrl', files);
        }
        this.callback.resolve(this.get('file'));
    },

    _sendToUploadPreprint() {
        this.send('uploadToPreprint');
    },

    _failCreateNewPreprint() {
        this.set('uploadInProgress', false);
        this.get('toast').error(this.get('i18n').t('components.file-uploader.could_not_create_preprint'));
    },

    _failUpdateTitle() {
        const currentPreprintTitle = this.get('currentPreprintTitle');
        this.set('model.title', currentPreprintTitle);
        this.set('uploadInProgress', false);
        this.get('toast').error(this.get('i18n').t('components.file-uploader.could_not_update_title'));
    },
});
