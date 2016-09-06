import Ember from 'ember';
import DS from 'ember-data';

import Permissions from 'ember-osf/const/permissions';

export const existingState = Object.freeze(Ember.Object.create({
    CHOOSE: 'choose',
    EXISTINGFILE: 'existing',
    NEWFILE: 'new'
}));

export default Ember.Component.extend({
    _existingState: existingState,
    userNodes: Ember.A(),
    selectedNode: null,
    isAdmin: Ember.computed('selectedNode', function() {
        if (this.get('selectedNode')) {
            return this.get('selectedNode.currentUserPermissions').indexOf(Permissions.ADMIN) !== -1;
        } else {
            return null;
        }
    }),
    osfProviderLoaded: false,
    osfStorageProvider: null,

    createComponent: null,
    existingState: existingState.CHOOSE,
    actions: {
        nodeSelected(node) {
            // Sets selectedNode, then loads node's osfstorage provider. Once osfstorage is loaded,
            // file-browser component can be loaded.
            this.set('selectedNode', node);
            this.set('selectedFile', null);
            this.set('osfProviderLoaded', false);
            this.get('selectedNode.files').then((files) => {
                this.set('osfStorageProvider', files.findBy('name', 'osfstorage'));
                this.set('osfProviderLoaded', true);
            });
        },
        selectFile(file) {
            // Select existing file from file-browser
            this.attrs.selectFile(file);
            if (this.get('selectedFile')) {
                this.highlightSuccessOrFailure('selectedFileExisting', this, 'success');
            }
        },
        changeExistingState(newState) {
            // Toggles existingState between 'existing' or 'new', meaning user wants to select existing file from file browser
            // or upload a new file.
            this.set('existingState', newState);
            this.set('selectedFile', null);
            this.set('hasFile', false);
        },
    },

    /**
     * Whether to show the file selection dropdown box
     * @property {boolean} fileSelect
     */
    fileSelect: false,
});
