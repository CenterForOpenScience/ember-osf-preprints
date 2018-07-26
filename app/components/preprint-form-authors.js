import { A } from '@ember/array';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import CpPanelBodyComponent from 'ember-collapsible-panel/components/cp-panel-body';
import { permissionSelector } from 'ember-osf/const/permissions';
import Analytics from 'ember-osf/mixins/analytics';
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Displays current preprint authors and their permissions/bibliographic information.
 * Allows user to search for authors, add authors, edit authors permissions/bibliographic
 * information, and remove authors.  Actions that are not allowed are disabled (for example,
 * you cannot remove the sole bibliographic author).
 *
 * Sample usage:
 * ```handlebars
 * {{preprint-form-authors
 *    contributors=contributors
 *    parentContributors=parentContributors
 *    node=node
 *    isAdmin=isAdmin
 *    canEdit=canEdit
 *    currentUser=user
 *    addContributor=(action 'addContributor')
 *    addContributors=(action 'addContributors')
 *    findContributors=(action 'findContributors')
 *    searchResults=searchResults
 *    removeContributor=(action 'removeContributor')
 *    editContributor=(action 'updateContributor')
 *    reorderContributors=(action 'reorderContributors')
 *    highlightSuccessOrFailure=(action 'highlightSuccessOrFailure')
 *    parentNode=parentNode
 *    editMode=editMode
}}
 * ```
 * @class preprint-form-authors
 */
export default CpPanelBodyComponent.extend(Analytics, {
    i18n: service(),
    raven: service(),
    authorModification: false,
    currentPage: 1,
    // Permissions labels for dropdown
    permissionOptions: permissionSelector,
    permission: null,
    parentContributorsAdded: false,
    addState: 'emptyView',
    current: null,
    contributor: null,
    draggedContrib: null,
    user: null,
    // There are 3 view states on left side of Authors panel. Default state just shows search bar.
    query: null,
    valid: alias('newContributorId'),
    // Returns list of user ids associated with current node
    currentContributorIds: computed('contributors', function() {
        const contribIds = [];
        this.get('contributors').forEach((contrib) => {
            contribIds.push(contrib.get('userId'));
        });
        return contribIds;
    }),
    // In Add mode, contributors are emailed on creation of preprint. In Edit mode,
    // contributors are emailed as soon as they are added to preprint.
    sendEmail: computed('editMode', function() {
        return this.get('editMode') ? 'preprint' : false;
    }),
    numParentContributors: computed('parentNode', function() {
        if (this.get('parentNode')) {
            return this.get('parentNode').get('contributors').get('length');
        } else {
            return 0;
        }
    }),
    // Total contributor search results
    totalSearchResults: computed('searchResults.[]', function() {
        const searchResults = this.get('searchResults');
        if (searchResults && searchResults.meta !== undefined) {
            return searchResults.meta.total;
        }
    }),
    // Total pages of contributor search results
    pages: computed('searchResults.[]', function() {
        const searchResults = this.get('searchResults');
        if (searchResults && searchResults.meta !== undefined) {
            return searchResults.meta.total_pages;
        }
    }),
    // TODO find alternative to jquery selectors. Temporary popover content for authors page.
    didInsertElement() {
        this.$('#permissions-popover').popover({
            container: 'body',
            content: '<dl>' +
                '<dt>Read</dt>' +
                    '<dd><ul><li>View preprint</li></ul></dd>' +
                '<dt>Read + Write</dt>' +
                    '<dd><ul><li>Read privileges</li> ' +
                        '<li>Add and configure preprint</li> ' +
                        '<li>Add and edit content</li></ul></dd>' +
                '<dt>Administrator</dt><dd><ul>' +
                    '<li>Read and write privileges</li>' +
                    '<li>Manage authors</li>' +
                    '<li>Public-private settings</li></ul></dd>' +
                '</dl>',
        });
        this.$('#bibliographic-popover').popover({
            container: 'body',
            content: 'Only checked authors will be included in preprint citations. ' +
            'Authors not in the citation can read and modify the preprint as normal.',
        });
        this.$('#author-popover').popover({
            container: 'body',
            content: 'Preprints must have at least one registered administrator and one author showing in the citation at all times.  ' +
            'A registered administrator is a user who has both confirmed their account and has administrator privileges.',
        });
    },

    actions: {
        // Adds contributor then redraws view - addition of contributor may change which
        // update/remove contributor requests are permitted
        addContributor(user) {
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Add Author`,
                });
            this.set('user', user);
            this.attrs.addContributor(user.id, 'write', true, this.get('sendEmail'), undefined, undefined, true)
                .then(this._addContributor.bind(this))
                .catch(this._failAddContributor.bind(this));
        },
        // Adds all contributors from parent project to current component
        // as long as they are not current contributors
        addContributorsFromParentProject() {
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Submit - Bulk Add Contributors From Parent',
                });
            this.set('parentContributorsAdded', true);
            const contributorsToAdd = A();
            this.get('parentContributors').toArray().forEach((contributor) => {
                if (this.get('currentContributorIds').indexOf(contributor.get('userId')) === -1) {
                    contributorsToAdd.push({
                        permission: contributor.get('permission'),
                        bibliographic: contributor.get('bibliographic'),
                        userId: contributor.get('userId'),
                    });
                }
            });
            this.attrs.addContributors(contributorsToAdd, this.get('sendEmail'))
                .then(this._addContributorsFromParent.bind(this))
                .catch(this._failAddContributorsFromParent.bind(this));
        },
        // Adds unregistered contributor, then clears form and switches back to search view.
        // Should wait to transition until request has completed.
        addUnregisteredContributor(fullName, email) {
            if (fullName && email) {
                const res = this.attrs.addContributor(null, 'write', true, this.get('sendEmail'), fullName, email, true);
                res.then((contributor) => {
                    this.get('contributors').pushObject(contributor);
                    this.toggleAuthorModification();
                    this.set('addState', 'searchView');
                    this.set('fullName', '');
                    this.set('email', '');
                    this.get('toast').success(this.get('i18n').t(
                        'submit.preprint_unregistered_author_added',
                        {
                            documentType: this.get('documentType'),
                        },
                    ));
                    this.highlightSuccessOrFailure(contributor.id, this, 'success');
                }, (error) => {
                    if (error.errors[0] && error.errors[0].detail && error.errors[0].detail.indexOf('is already a contributor') > -1) {
                        this.get('toast').error(error.errors[0].detail);
                    } else {
                        this.get('toast').error(this.get('i18n').t('submit.error_adding_unregistered_author'));
                        this.get('raven').captureMessage('Could not add unregistered author', { extra: { error } });
                    }
                    this.highlightSuccessOrFailure('add-unregistered-contributor-form', this, 'error');
                });
            }
        },
        // Requests a particular page of user results
        findContributors(page) {
            const query = this.get('query');
            if (query) {
                this.attrs.findContributors(query, page)
                    .then(this._searchView.bind(this))
                    .catch(this._failSearchQuery.bind(this));
            }
        },
        // Removes contributor then redraws contributor list view -
        // removal of contributor may change which additional update/remove requests are permitted.
        removeContributor(contrib) {
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Remove Author`,
                });

            this.set('contributor', contrib);

            this.attrs.removeContributor(contrib)
                .then(this._removeContributor.bind(this))
                .catch(this._failRemoveContributor.bind(this));
        },
        // Updates contributor then redraws contributor list view - updating contributor
        // permissions may change which additional update/remove requests are permitted.
        updatePermissions(contributor, permission) {
            this.get('metrics')
                .trackEvent({
                    category: 'dropdown',
                    action: 'select',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Change Author Permissions`,
                });

            this.set('contributor', contributor);
            this.set('permission', permission);

            this.attrs.editContributor(contributor, permission, '')
                .then(this._modifyAuthorPermission.bind(this))
                .catch(this._failModifyAuthorPermission.bind(this));
        },
        // Updates contributor then redraws contributor list view - updating contributor
        // bibliographic info may change which additional update/remove requests are permitted.
        updateBibliographic(contributor, isBibliographic) {
            this.set('contributor', contributor);

            this.get('metrics')
                .trackEvent({
                    category: 'checkbox',
                    action: 'select',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Update Bibliographic Author`,
                });
            this.attrs.editContributor(contributor, '', isBibliographic)
                .then(this._successUpdateCitation.bind(this))
                .catch(this._failUpdateCitation.bind(this));
        },
        // There are 3 view states on left side of Authors panel.
        // This switches to add unregistered contrib view.
        unregisteredView() {
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Go to Add Author by Email Form`,
                });
            this.set('addState', 'unregisteredView');
        },
        // There are 3 view states on left side of Authors panel.
        // This switches to searching contributor results view.
        searchView() {
            this.set('addState', 'searchView');
            this.set('fullName', '');
            this.set('email', '');
        },
        // There are 3 view states on left side of Authors panel.
        // This switches to empty view and clears search results.
        resetfindContributorsView() {
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Cancel Add Author By Email`,
                });
            this.set('addState', 'searchView');
        },
        // Reorders contributors in UI then sends server request to reorder contributors.
        // If request fails, reverts contributor list in UI back to original.
        reorderItems(itemModels, draggedContrib) {
            this.set('draggedContrib', draggedContrib);

            this.get('metrics')
                .trackEvent({
                    category: 'div',
                    action: 'drag',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Reorder Authors`,
                });
            this.set('contributors', itemModels);
            const newIndex = itemModels.indexOf(draggedContrib);
            this.attrs.reorderContributors(draggedContrib, newIndex, itemModels)
                .then(this._sendHighlightSuccess.bind(this))
                .catch(this._sendHighlightFailure.bind(this));
        },
        // Action used by the pagination-pager component to the handle user-click event.
        pageChanged(current) {
            this.set('current', current);

            const query = this.get('query');
            if (query) {
                this.attrs.findContributors(query, current)
                    .then(this._setSearchState.bind(this))
                    .catch(this._failSearchQuery.bind(this));
            }
        },
    },
    /* If user removes their own admin permissions, many things on the page must become
    disabled.  Changing the isAdmin flag to false will remove many of the options
    on the page. */
    removedSelfAsAdmin(contributor, permission) {
        if (this.get('currentUser').id === contributor.get('userId') && permission !== 'ADMIN') {
            this.set('isAdmin', false);
        }
    },
    /* Toggling this property, authorModification, updates several items on the page -
    disabling elements, enabling others, depending on what requests are permitted */
    toggleAuthorModification() {
        this.toggleProperty('authorModification');
    },

    _addContributorsFromParent(contributors) {
        contributors.forEach((contrib) => {
            this.get('contributors').pushObject(contrib);
        });
        this.toggleAuthorModification();
    },

    _failAddContributorsFromParent(error) {
        this.get('toast').error('Some contributors may not have been added. Try adding manually.');
        this.get('raven').captureMessage('Could not add some contributors', { extra: { error } });
    },

    _addContributor(res) {
        this.toggleAuthorModification();
        this.get('contributors').pushObject(res);
        this.get('toast').success(this.get('i18n').t('submit.preprint_author_added', {
            documentType: this.get('documentType'),
        }));
        this.highlightSuccessOrFailure(res.id, this, 'success');
    },

    _failAddContributor(error) {
        const user = this.get('user');

        this.get('toast').error(this.get('i18n').t('submit.error_adding_author'));
        this.get('raven').captureMessage('Could not add author', { extra: { error } });
        this.highlightSuccessOrFailure(user.id, this, 'error');
        user.rollbackAttributes();
    },

    _searchView() {
        this.set('addState', 'searchView');
    },

    _removeContributor() {
        const contributor = this.get('contributor');

        this.toggleAuthorModification();
        this.removedSelfAsAdmin(contributor, contributor.get('permission'));
        this.get('contributors').removeObject(contributor);
        this.get('toast').success(this.get('i18n').t(
            'submit.preprint_author_removed',
            {
                documentType: this.get('documentType'),
            },
        ));
    },

    _failRemoveContributor(error) {
        const contributor = this.get('contributor');

        this.get('toast').error(this.get('i18n').t('submit.error_adding_author'));
        this.get('raven').captureMessage('Could not remove contributor', { extra: { error } });
        this.highlightSuccessOrFailure(contributor.id, this, 'error');
        contributor.rollbackAttributes();
    },

    _modifyAuthorPermission() {
        const contributor = this.get('contributor');
        const permission = this.get('permission');

        this.toggleAuthorModification();
        this.highlightSuccessOrFailure(contributor.id, this, 'success');
        this.removedSelfAsAdmin(contributor, permission);
    },

    _failModifyAuthorPermission(error) {
        const contributor = this.get('contributor');

        this.get('toast').error('Could not modify author permissions');
        this.get('raven').captureMessage('Could not modify author permissions', { extra: { error } });
        this.highlightSuccessOrFailure(contributor.id, this, 'error');
        contributor.rollbackAttributes();
    },

    _successUpdateCitation() {
        const contributor = this.get('contributor');

        this.toggleAuthorModification();
        this.highlightSuccessOrFailure(contributor.id, this, 'success');
    },

    _failUpdateCitation(error) {
        const contributor = this.get('contributor');

        this.get('toast').error('Could not modify citation');
        this.get('raven').captureMessage('Could not modify citation', { extra: { error } });
        this.highlightSuccessOrFailure(contributor.id, this, 'error');
        contributor.rollbackAttributes();
    },

    _sendHighlightSuccess() {
        const draggedContrib = this.get('draggedContrib');

        this.highlightSuccessOrFailure(draggedContrib.id, this, 'success');
    },

    _sendHighlightFailure(error) {
        const draggedContrib = this.get('draggedContrib');
        const originalOrder = this.get('contributors');

        this.highlightSuccessOrFailure(draggedContrib.id, this, 'error');
        this.set('contributors', originalOrder);
        this.get('toast').error('Could not reorder contributors');
        this.get('raven').captureMessage('Could not reorder contributors', { extra: { error } });
        draggedContrib.rollbackAttributes();
    },

    _setSearchState() {
        const current = this.get('current');

        this.set('addState', 'searchView');
        this.set('currentPage', current);
    },

    _failSearchQuery(error) {
        this.get('toast').error('Could not perform search query.');
        this.get('raven').captureMessage('Could not perform search query', { extra: { error } });
        this.highlightSuccessOrFailure('author-search-box', this, 'error');
    },
});
