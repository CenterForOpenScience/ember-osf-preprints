import Ember from 'ember';
import Permissions from 'ember-osf/const/permissions';
import Analytics from '../mixins/analytics';
import {stripDiacritics} from 'ember-power-select/utils/group-utils';
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Preprint form project select widget - handles all ADD mode cases where the first step is to select an existing OSF project to contain
 * your preprint.  Also used in EDIT mode - as we keep the project locked after preprint has been published.  Therefore, you must use an existing project!
 *
 *  Uses the file-uploader component, hence the large number of properties for this component, that are passed along to the file-uploader.
 *  Cases not needing the file-uploader are where you are selecting an existing file on an existing node, or copying a file into
 *  a newly-created component - no file uploading needed.
 *
 * {{preprint-form-project-select
 * ```handlebars
 *      changeInitialState=(action 'changeInitialState')
 *      finishUpload=(action 'finishUpload')
 *     clearDownstreamFields=(action 'clearDownstreamFields')
 *     nextUploadSection=(action 'nextUploadSection')
 *     existingNodeExistingFile=(action 'existingNodeExistingFile')
 *     createComponentCopyFile=(action "createComponentCopyFile")
 *     selectFile=(action "selectExistingFile")
 *     highlightSuccessOrFailure=(action 'highlightSuccessOrFailure')
 *     startPreprint=(action 'startPreprint')
 *     discardUploadChanges=(action 'discardUploadChanges')
 *     startState=_State.START
 *     existingState=existingState
 *     _existingState=_existingState
 *     nodeTitle=nodeTitle
 *     currentUser=user
 *     selectedFile=selectedFile
 *     hasFile=hasFile
 *     file=file
 *     node=node
 *     userNodes=userNodes
 *     selectedNode=node
 *     contributors=contributors
 *     fileSelect=true
 *     currentState=filePickerState
 *     parentNode=parentNode
 *     convertProjectConfirmed=convertProjectConfirmed
 *     userNodesLoaded=userNodesLoaded
 *     convertOrCopy=convertOrCopy
 *     isTopLevelNode=isTopLevelNode
 *     nodeLocked=nodeLocked
 *     osfStorageProvider=osfStorageProvider
 *     osfProviderLoaded=osfProviderLoaded
 *     titleValid=titleValid
 *     uploadChanged=uploadChanged
 *     uploadInProgress=uploadInProgress
 *     abandonedPreprint=abandonedPreprint
 *     resumeAbandonedPreprint=(action 'resumeAbandonedPreprint')
 *     basicsAbstract=basicsAbstract
 *     editMode=editMode
 *     newNode=newNode
 *     applyLicense=applyLicense
 * }}
 * @class preprint-form-project-select
 */
export default Ember.Component.extend(Analytics, {
    userNodes: Ember.A(),
    selectedNode: null,
    isAdmin: Ember.computed('selectedNode', function() {
        return this.get('selectedNode') ? (this.get('selectedNode.currentUserPermissions') || []).includes(Permissions.ADMIN) : false;
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
                    category: 'file browser',
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

    titleMatcher(node, term) {
        // Passed into power-select component for customized searching.
        // Returns results if match in node, root, or parent title
        const fields = [
            'title',
            'root.title',
            'parent.title'
        ];

        const sanitizedTerm = stripDiacritics(term).toLowerCase();

        for (const field of fields) {
            const fieldValue = node.get(field) || '';

            if (!fieldValue) continue;

            const sanitizedValue = stripDiacritics(fieldValue).toLowerCase();

            if (sanitizedValue.includes(sanitizedTerm)) {
                return 1;
            }
        }
        return -1;
    }
});
