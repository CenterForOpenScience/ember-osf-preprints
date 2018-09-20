import Component from '@ember/component';
import { A } from '@ember/array';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Permissions from 'ember-osf/const/permissions';
import { loadPage } from 'ember-osf/utils/load-relationship';
import Analytics from 'ember-osf/mixins/analytics';
import { task, timeout } from 'ember-concurrency';
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Preprint form project select widget - used wherever you need to load a list of user projects
 * Used in two places - where the user is selecting a file from an existing project (to copy to their preprint),
 * and where a user is choosing their supplemental project
 *
 *
 * {{preprint-form-project-select
 * ```handlebars
 *      changeInitialState=(action 'changeInitialState')
 *     clearDownstreamFields=(action 'clearDownstreamFields')
 *     nextUploadSection=(action 'nextUploadSection')
 *     selectFile=(action "selectExistingFile")
 *     discardUploadChanges=(action 'discardUploadChanges')
 *     startState=_State.START
 *     title=title
 *     currentUser=user
 *     selectedFile=selectedFile
 *     hasFile=hasFile
 *     selectedNode=node
 *     currentState=currentState
 *     preprintLocked=preprintLocked
 *     osfStorageProvider=osfStorageProvider
 *     osfProviderLoaded=osfProviderLoaded
 *     titleValid=titleValid
 *     basicsAbstract=basicsAbstract
 *     editMode=editMode
 *     getProjectContributors=(action 'getProjectContributors')
 *     provider=currentProvider
 *     createPreprintCopyFile=(action 'createPreprintCopyFile')
 * }}
 * @class preprint-form-project-select
 */
export default Component.extend(Analytics, {
    panelActions: service('panelActions'),
    selectedNode: null,
    selectedSupplementalProject: null,
    currentPage: 1,
    searchTerm: '',
    canLoadMore: false,
    isLoading: false,
    currentPanelName: null,

    userNodes: A(),
    isNodeAdmin: computed('selectedNode', function() {
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
            this.get('selectedNode.files').then(this._setStorageProvider.bind(this));
            this.attrs.nextUploadSection('chooseProject', 'selectExistingFile');
            this.get('metrics')
                .trackEvent({
                    category: 'dropdown',
                    action: 'select',
                    label: 'Submit - Choose Project',
                    extra: node.id,
                });
            this.set('title', node.get('title'));
            this.set('description', node.get('description'));
            this.set('tags', node.get('tags'));
            this.set('titleValid', true);
            this.getProjectContributors(node);
        },

        selectFile(file) {
            // Select existing node file from file-browser -
            // This file will be eventually copied to the preprint
            this.attrs.nextUploadSection('selectExistingFile', 'finalizeUpload');
            this.attrs.selectFile(file);
            this.get('metrics')
                .trackEvent({
                    category: 'file browser',
                    action: 'select',
                    label: 'Submit - Existing File Selected',
                    extra: file.id,
                });
        },

        supplementalProjectSelected(node) {
            // Sets selectedSupplementalProject
            // These are pending values until the preprint form is submitted
            this.set('selectedSupplementalProject', node);
            this.get('metrics')
                .trackEvent({
                    category: 'dropdown',
                    action: 'select',
                    label: 'Submit - Choose Supplemental Project',
                    extra: node.id,
                });
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

});
