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
 *   startPreprint=(action 'startPreprint')
 *   discardUploadChanges=(action 'discardUploadChanges')
 *   newNodeNewFile=true
 *   startState=_State.START
 *   existingState=existingState
 *   _existingState=_existingState
 *   title=title
 *   currentUser=user
 *   osfFile=selectedFile
 *   hasFile=hasFile
 *   file=file
 *   node=node
 *   parentNode=parentNode
 *   convertProjectConfirmed=convertProjectConfirmed
 *   convertOrCopy=convertOrCopy
 *   isTopLevelNode=isTopLevelNode
 *   nodeLocked=nodeLocked
 *   titleValid=titleValid
 *   uploadChanged=uploadChanged
 *   uploadInProgress=uploadInProgress
 *   abandonedPreprint=abandonedPreprint
 *   resumeAbandonedPreprint=(action 'resumeAbandonedPreprint')
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
    raven: service(),
    panelActions: service('panelActions'),

    State,
    url: null,
    node: null,
    callback: null,
    currentNodeTitle: null,
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

        setNodeAndFile() {
            // Switches between various upload scenarios involving uploading file to
            // 1) a new project 2) a new component 3) an existing node.
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

        createComponentAndUploadFile() {
            // Upload case for using a new component and a new file for the preprint.
            // Creates component of parent node and then uploads file to newly created component.
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Submit - Save and Continue, New Component New File',
                });
            const node = this.get('node');
            node
                .addChild(this.get('title'))
                .then(this._createComponent.bind(this))
                .catch(this._failCreateComponent.bind(this));
        },

        uploadFileToExistingNode() {
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
            const node = this.get('node');
            this.set('basicsAbstract', this.get('model.description') || null);
            const currentNodeTitle = node.get('title');

            if (currentNodeTitle !== this.get('title')) {
                model.set('title', this.get('title'));
                node.set('title', this.get('title'));
                node.save()
                    .then(this._sendToUpload.bind(this))
                    .catch(this._failUpdateTitle.bind(this));
            } else {
                this.send('upload');
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
                this.attrs.nextUploadSection('uploadNewFile', 'organize');
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
                                this.sendAction('finishUpload');
                            }
                            if (window.Dropzone) window.Dropzone.forElement('.dropzone').removeAllFiles(true);
                        } else { // Add mode
                            return this.get('abandonedPreprint') ? this.sendAction('resumeAbandonedPreprint') : this.sendAction('startPreprint', this.get('parentNode'));
                        }
                    })
                    .catch((error) => {
                        this.get('toast').error(this.get('i18n').t(
                            'components.file-uploader.preprint_file_error',
                            {
                                documentType: this.get('provider.documentType'),
                            },
                        ));
                        this.set('uploadInProgress', false);
                        this.get('raven').captureMessage('Could not create component', { extra: { error } });
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

            if (this.get('newNodeNewFile')) {
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
        this.getContributors(node);
        this.send('upload');
        this.set('newNode', true);
        this.set('applyLicense', true);
    },

    _failCreateNewProject(error) {
        this.set('uploadInProgress', false);
        this.get('toast').error(this.get('i18n').t('components.file-uploader.could_not_create_project'));
        this.get('raven').captureMessage('Could not create project', { extra: { error } });
    },

    _createComponent(child) {
        const node = this.get('node');

        this.set('parentNode', node);
        this.set('node', child);
        this.set('basicsAbstract', this.get('node.description') || null);
        this.send('upload');
        this.set('newNode', true);
        this.set('applyLicense', true);
    },

    _failCreateComponent(error) {
        this.set('uploadInProgress', false);
        this.get('toast').error(this.get('i18n').t('components.file-uploader.could_not_create_component'));
        this.get('raven').captureMessage('Could not create component', { extra: { error } });
    },

    _sendToUpload() {
        this.send('upload');
    },

    _failUpdateTitle(error) {
        const node = this.get('node');
        const currentNodeTitle = this.get('currentNodeTitle');

        node.set('title', currentNodeTitle);
        this.set('uploadInProgress', false);
        this.get('toast').error(this.get('i18n').t('components.file-uploader.could_not_update_title'));
        this.get('raven').captureMessage('Could not update title', { extra: { error } });
    },

    _failUploadFile() {
        this.get('toast').error(this.get('i18n').t('components.file-uploader.preprint_file_error'));
        this.set('uploadInProgress', false);
    },
});
