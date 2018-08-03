import Component from '@ember/component';
import { A } from '@ember/array';
import { computed } from '@ember/object';

import { stripDiacritics } from 'ember-power-select/utils/group-utils';
import { task, timeout } from 'ember-concurrency';

import Permissions from 'ember-osf/const/permissions';
import { loadPage } from 'ember-osf/utils/load-relationship';
import Analytics from 'ember-osf/mixins/analytics';

/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Allows searching projects and selecting one.
 *
 * {{search-user-projects
 * ```handlebars
 *     currentUser=user
 *     selectedNode=node
 * }}
 * @class preprint-form-project-select
 */
export default Component.extend(Analytics, {
    selectedNode: null,
    currentPage: 1,
    searchTerm: '',
    canLoadMore: false,
    isLoading: false,

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

        selectNode(node) {
            this.set('selectedNode', node);

            this.get('metrics').trackEvent({
                category: 'dropdown',
                action: 'select',
                label: 'Submit - Choose Project',
                extra: node.id,
            });
        },
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
