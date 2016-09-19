import Ember from 'ember';
import Permissions from 'ember-osf/const/permissions';

export const existingState = Object.freeze(Ember.Object.create({
    CHOOSE: 'choose',
    EXISTINGFILE: 'existing',
    NEWFILE: 'new'
}));

/**
 * Preprint form project select widget - handles all cases where the first step is to select an existing OSF project to contain
 * your preprint.
 *
 *  Uses the file-uploader component, hence the large number of properties for this component, that are passed along to the file-uploader.
 *  Cases not needing the file-uploader are where you are selecting an existing file on an existing node, or copying a file into
 *  a newly-created component - no file uploading needed.
 *
 * Sample usage:
 * ```handlebars
 *{{preprint-form-project-select
 *         changeState=(action 'changeToInitialState')
 *         finishUpload=(action 'finishUpload')
 *         existingNodeExistingFile=(action 'existingNodeExistingFile')
 *         createComponentCopyFile=(action "createComponentCopyFile")
 *         selectFile=(action "selectExistingFile")
 *         highlightSuccessOrFailure=(action 'highlightSuccessOrFailure')
 *         startState=_State.START
 *         nodeTitle=nodeTitle
 *         currentUser=user
 *         selectedFile=selectedFile
 *         hasFile=hasFile
 *         file=file
 *         node=node
 *         userNodes=userNodes
 *         selectedNode=node
 *         contributors=contributors
 *         fileSelect=true
 *         currentState=filePickerState
 *         convertProjectConfirmed=convertProjectConfirmed
 *         userNodesLoaded=userNodesLoaded
 *         }}
 * ```
 * @class preprint-form-project-select
 */
export default Ember.Component.extend({
    _existingState: existingState,
    userNodes: Ember.A(),
    selectedNode: null,
    panelActions: Ember.inject.service(),
    isAdmin: Ember.computed('selectedNode', function() {
        if (this.get('selectedNode')) {
            return this.get('selectedNode.currentUserPermissions').indexOf(Permissions.ADMIN) !== -1;
        } else {
            return null;
        }
    }),
    osfProviderLoaded: false, // True when selectedNode's osfstorage provider has been loaded.  T
    osfStorageProvider: null,

    createComponent: null,
    existingState: existingState.CHOOSE,
    actions: {
        nodeSelected(node) {
            // Sets selectedNode, then loads node's osfstorage provider. Once osfProviderLoaded,
            // file-browser component can be loaded.
            this.set('selectedNode', node);
            this.get('panelActions').toggle('chooseProject');
            this.set('selectedFile', null);
            this.set('osfProviderLoaded', false);
            this.send('changeExistingState', existingState.CHOOSE);
            this.get('selectedNode.files').then((files) => {
                this.set('osfStorageProvider', files.findBy('name', 'osfstorage'));
                this.set('osfProviderLoaded', true);
            });
        },
        selectFile(file) {
            // Select existing file from file-browser
            this.attrs.selectFile(file);
            this.get('panelActions').toggle('selectExistingFile');
            this.get('panelActions').toggle('organize');
            if (this.get('selectedFile')) {
                this.highlightSuccessOrFailure('selectedFileExisting', this, 'success');
            }
        },
        changeExistingState(newState) {
            // Toggles existingState between 'existing' or 'new', meaning user wants to select existing file from file browser
            // or upload a new file.
            this.set('existingState', newState);
            this.get('panelActions').toggle('chooseFile');
            if (newState === existingState.EXISTINGFILE) {
                this.get('panelActions').toggle('selectExistingFile');
            }
            if (newState === existingState.NEWFILE) {
                this.get('panelActions').toggle('uploadNewFile');
            }
            this.set('selectedFile', null);
            this.set('hasFile', false);
            this.set('nodeTitle', null);
            this.set('convertOrCopy', null);
        },
    },

    /**
     * Whether to show the file selection dropdown box
     * @property {boolean} fileSelect
     */
    fileSelect: false,
});
