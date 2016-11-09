import Ember from 'ember';
import Permissions from 'ember-osf/const/permissions';

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
export default Ember.Component.extend({
    userNodes: Ember.A(),
    selectedNode: null,
    isAdmin: Ember.computed('selectedNode', function() {
        return this.get('selectedNode') ? (this.get('selectedNode.currentUserPermissions') || []).includes(Permissions.ADMIN) : false;
    }),
    actions: {
        nodeSelected(node) {
            // Sets selectedNode, then loads node's osfstorage provider. Once osfProviderLoaded, file-browser component can be loaded.
            this.set('selectedNode', node);
            this.send('checkOtherPreprints', node);
            if (this.get('fileLocked')) { // Node contains published preprints from other providers
                this.send('changeExistingState', this.get('_existingState').NEWFILE);
                this.attrs.nextUploadSection('chooseProject', 'uploadNewFile');
            } else {
                this.attrs.clearDownstreamFields('belowNode');
                this.set('osfProviderLoaded', false);
                this.send('changeExistingState', this.get('_existingState').CHOOSE);
                this.get('selectedNode.files').then((files) => {
                    this.set('osfStorageProvider', files.findBy('name', 'osfstorage'));
                    this.set('osfProviderLoaded', true);
                });
                this.attrs.nextUploadSection('chooseProject', 'chooseFile');
            }
        },
        selectFile(file) {
            // Select existing file from file-browser
            this.attrs.clearDownstreamFields('belowFile');
            this.attrs.selectFile(file);
            this.attrs.nextUploadSection('selectExistingFile', 'organize');
        },
        changeExistingState(newState) {
            // Toggles existingState between 'existing' or 'new', meaning user wants to select existing file from file browser
            // or upload a new file.
            this.attrs.clearDownstreamFields('belowNode');
            this.set('existingState', newState);
            if (newState === this.get('_existingState').EXISTINGFILE) {
                this.attrs.nextUploadSection('chooseFile', 'selectExistingFile');
            } else if (newState === this.get('_existingState').NEWFILE) {
                this.attrs.nextUploadSection('chooseFile', 'uploadNewFile');
            }
        },
        checkOtherPreprints(node) {
            // Checks node for published preprints from other providers. If they exist, set fileLocked to true.
            this.set('fileLocked', false);
            let preprints = node.get('preprints').toArray();
            let currentProvider = this.get('currentProvider');

            if (preprints.toArray().length > 0) { // If node already has a preprint
                for (const preprint of preprints.toArray()) {
                    var preprintProvider = this.getPreprintProvider(preprint);
                    if (preprint.get('isPublished') && currentProvider !== preprintProvider) {
                        this.set('fileLocked', true);
                    }
                }
            }
        }
    },

    /**
     * Whether to show the file selection dropdown box
     * @property {boolean} fileSelect
     */
    fileSelect: false,
    getPreprintProvider(preprint) {
        return preprint.get('links.relationships.provider.links.related.href').split('preprint_providers/')[1].replace('/', '');
    },
});
