import Component from '@ember/component';
import { A } from '@ember/array';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Permissions from 'ember-osf/const/permissions';
import { loadPage } from 'ember-osf/utils/load-relationship';
import Analytics from 'ember-osf/mixins/analytics';
import { stripDiacritics } from 'ember-power-select/utils/group-utils';
import { task, timeout } from 'ember-concurrency';
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Preprint form project select widget - handles all ADD mode cases where the first step is to
 * select an existing OSF project to contain your preprint.  Also used in EDIT mode - as we
 * keep the project locked after preprint has been published.
 * Therefore, you must use an existing project!
 *
 *  Uses the file-uploader component, hence the large number of properties for this component,
 *  that are passed along to the file-uploader. Cases not needing the file-uploader are where
 *  you are selecting an existing file on an existing node, or copying a file into
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
 *     title=title
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
export default Component.extend(Analytics, {
    panelActions: service('panelActions'),
    selectedNode: null,
    currentPage: 1,
    searchTerm: '',
    canLoadMore: false,
    isLoading: false,
    currentPanelName: null,

    // Whether to show the file selection dropdown box
    fileSelect: false,

    userNodes: A(),
    isAdmin: computed('selectedNode', function() {
        return this.get('selectedNode') ? (this.get('selectedNode.currentUserPermissions') || []).includes(Permissions.ADMIN) : false;
    }),

    init() {
        this._super(...arguments);
        this.get('_getInitialUserNodes').perform();
    },

    actions: {
        getDefaultUserNodes(term) {
            if (term === '') {
                this.get('_getInitialUserNodes').perform(term);
            }
        },

        getMoreUserNodes() {
            this.get('_getMoreUserNodes').perform();
        },

        onFocus() {
            this.get('_getInitialUserNodes').perform('');
        },

        onBlur() {
            this.get('userNodes').clear();
        },

        nodeSelected(node) {
            // Sets selectedNode, then loads node's osfstorage provider.
            // Once osfProviderLoaded, file-browser component can be loaded.
            this.attrs.clearDownstreamFields('belowNode');
            this.set('selectedNode', node);
            this.set('osfProviderLoaded', false);
            this.send('changeExistingState', this.get('_existingState').CHOOSE);
            this.get('selectedNode.files').then(this._setStorageProvider.bind(this));
            this.attrs.nextUploadSection('chooseProject', 'chooseFile');
            this.get('metrics')
                .trackEvent({
                    category: 'dropdown',
                    action: 'select',
                    label: 'Submit - Choose Project',
                    extra: node.id,
                });
            this.getNodePreprints(node);
            this.getContributors(node);
        },
        selectFile(file) {
            // Select existing file from file-browser
            this.attrs.clearDownstreamFields('belowFile');
            this.attrs.selectFile(file);
            this.attrs.nextUploadSection('selectExistingFile', 'organize');
            this.get('metrics')
                .trackEvent({
                    category: 'file browser',
                    action: 'select',
                    label: 'Submit - Existing File Selected',
                    extra: file.id,
                });
        },
        changeExistingState(newState) {
            // Toggles existingState between 'existing' or 'new',
            // meaning user wants to select existing file from file browser or upload a new file.
            this.attrs.clearDownstreamFields('belowNode');
            this.set('existingState', newState);
            if (newState === this.get('_existingState').EXISTINGFILE) {
                this.attrs.nextUploadSection('chooseFile', 'selectExistingFile');
                this.get('metrics')
                    .trackEvent({
                        category: 'button',
                        action: 'click',
                        label: 'Submit - Choose Select Existing File as Preprint',
                    });
            } else if (newState === this.get('_existingState').NEWFILE) {
                this.attrs.nextUploadSection('chooseFile', 'uploadNewFile');
                this.get('metrics')
                    .trackEvent({
                        category: 'button',
                        action: 'click',
                        label: 'Submit - Choose Upload Preprint',
                    });
            }
        },
    },

    _setStorageProvider(files) {
        this.set('osfStorageProvider', files.findBy('name', 'osfstorage'));
        this.set('osfProviderLoaded', true);
    },

    // Only make a request every 500 ms to let user finish typing.
    _getInitialUserNodes: task(function* (searchTerm) {
        const userNodes = this.get('userNodes');
        userNodes.clear();
        yield timeout(500);
        this.set('currentPage', 1);
        const currentUser = this.get('currentUser');
        const results = yield loadPage(currentUser, 'nodes', 10, 1, {
            filter: {
                preprint: false,
                title: searchTerm,
            },
            embed: 'parent',
        });
        // When the promise finishes, set the searchTerm
        this.set('searchTerm', searchTerm);
        const onlyAdminNodes = results.results.filter(item => item.get('currentUserPermissions').includes(Permissions.ADMIN));
        if (results.hasRemaining) {
            this.set('canLoadMore', true);
        } else {
            this.set('canLoadMore', false);
        }
        userNodes.pushObjects(onlyAdminNodes);
    }).restartable(),

    _getMoreUserNodes: task(function* () {
        this.set('isLoading', true);
        const currentPage = this.get('currentPage');
        const currentUser = this.get('currentUser');
        const searchTerm = this.get('searchTerm');
        const nextPage = currentPage + 1;
        const results = yield loadPage(currentUser, 'nodes', 10, nextPage, {
            filter: {
                preprint: false,
                title: searchTerm,
            },
            embed: 'parent',
        });
        const userNodes = this.get('userNodes');
        let onlyAdminNodes = results.results.filter(item => item.get('currentUserPermissions').includes(Permissions.ADMIN));
        onlyAdminNodes = onlyAdminNodes.filter(item => !userNodes.contains(item));
        userNodes.pushObjects(onlyAdminNodes);
        if (results.hasRemaining) {
            this.set('canLoadMore', true);
            this.set('currentPage', nextPage);
        } else {
            this.set('canLoadMore', false);
        }
        this.set('isLoading', false);
    }).enqueue(),

    titleMatcher(node, term) {
        // Passed into power-select component for customized searching.
        // Returns results if match in node, root, or parent title
        const fields = [
            'title',
            'root.title',
            'parent.title',
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
    },
});
