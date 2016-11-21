import Ember from 'ember';
import Permissions from 'ember-osf/const/permissions';
import Analytics from '../mixins/analytics';

/**
 * Preprint form project select widget - handles all ADD mode cases where the first step is to select an existing OSF project to contain
 * your preprint.  Also used in EDIT mode - as we keep the project locked after preprint has been published.  Therefore, you must use an existing project!
 *
 *  Uses the file-uploader component, hence the large number of properties for this component, that are passed along to the file-uploader.
 *  Cases not needing the file-uploader are where you are selecting an existing file on an existing node, or copying a file into
 *  a newly-created component - no file uploading needed.
 *
 * @class preprint-form-project-select
 */
export default Ember.Component.extend(Analytics, {
    userNodes: Ember.A(),
    selectedNode: null,
    isAdmin: Ember.computed('selectedNode', function() {
        if (this.get('selectedNode')) {
            return (this.get('selectedNode.currentUserPermissions') || []).includes(Permissions.ADMIN);
        } else {
            return null;
        }
    }),
    actions: {
        nodeSelected(node) {
            // Sets selectedNode, then loads node's osfstorage provider. Once osfProviderLoaded, file-browser component can be loaded.
            this.attrs.clearDownstreamFields('belowNode');
            this.set('selectedNode', node);
            this.set('osfProviderLoaded', false);
            this.send('changeExistingState', this.get('_existingState').CHOOSE);
            this.get('selectedNode.files').then((files) => {
                this.set('osfStorageProvider', files.findBy('name', 'osfstorage'));
                this.set('osfProviderLoaded', true);
            });
            this.attrs.nextUploadSection('chooseProject', 'chooseFile');
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'dropdown',
                    action: 'select',
                    label: 'Preprints - Submit - Choose Project'
                });

        },
        selectFile(file) {
            // Select existing file from file-browser
            this.attrs.clearDownstreamFields('belowFile');
            this.attrs.selectFile(file);
            this.attrs.nextUploadSection('selectExistingFile', 'organize');
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'filebrowser',
                    action: 'select',
                    label: 'Preprints - Submit - Existing File Selected'
                });
        },
        changeExistingState(newState) {
            // Toggles existingState between 'existing' or 'new', meaning user wants to select existing file from file browser
            // or upload a new file.
            this.attrs.clearDownstreamFields('belowNode');
            this.set('existingState', newState);
            if (newState === this.get('_existingState').EXISTINGFILE) {
                this.attrs.nextUploadSection('chooseFile', 'selectExistingFile');
                Ember.get(this, 'metrics')
                    .trackEvent({
                        category: 'button',
                        action: 'click',
                        label: 'Preprints - Submit - Choose Select Existing File as Preprint'
                    });

            } else if (newState === this.get('_existingState').NEWFILE) {
                this.attrs.nextUploadSection('chooseFile', 'uploadNewFile');
                Ember.get(this, 'metrics')
                    .trackEvent({
                        category: 'button',
                        action: 'click',
                        label: 'Preprints - Submit - Choose Upload Preprint'
                    });
            }
        },
    },

    /**
     * Whether to show the file selection dropdown box
     * @property {boolean} fileSelect
     */
    fileSelect: false,
});
