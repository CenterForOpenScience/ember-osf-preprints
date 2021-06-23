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
 *    model=model
 *    isAdmin=isAdmin
 *    currentUser=user
 *    findContributors=(action 'findContributors')
 *    searchResults=searchResults
 *    currentUserRemoved=(action 'currentUserRemoved')
 *    reorderContributors=(action 'reorderContributors')
 *    highlightSuccessOrFailure=(action 'highlightSuccessOrFailure')
 *    editMode=editMode
 *    canEdit=canEdit
 *    documentType=currentProvider.documentType
}}
 * ```
 * @class preprint-form-authors
 */
export default CpPanelBodyComponent.extend(Analytics, {
    i18n: service(),
    authorModification: false,
    currentPage: 1,
    // Permissions labels for dropdown
    permissionOptions: permissionSelector,
    permission: null,
    addState: 'emptyView',
    current: null,
    contributor: null,
    draggedContrib: null,
    showRemoveSelfModal: false,
    removeButtonDisabled: false,
    removeContributorModalTitle: 'Are you sure you want to remove this contributor?',
    user: null,
    searchResults: null,
    // There are 3 view states on left side of Authors panel. Default state just shows search bar.
    query: null,
    valid: alias('newContributorId'),
    // In Add mode, contributors are emailed on creation of preprint. In Edit mode,
    // contributors are emailed as soon as they are added to preprint.
    sendEmail: computed('editMode', function() {
        return this.get('editMode') ? 'preprint' : false;
    }),
    // Total pages of contributor search results
    pages: computed('searchResults.[]', function() {
        const searchResults = this.get('searchResults');
        if (searchResults && searchResults.meta !== undefined) {
            return searchResults.meta.total_pages;
        }
    }),
    currentContrib: computed('contributors', 'currentUser', function() {
        return this.get('contributors').filter(contrib => contrib.get('userId') === this.get('currentUser').id)[0];
    }),
    // TODO find alternative to jquery selectors. Temporary popover content for authors page.
    didInsertElement() {
        this.$('#permissions-popover').popover({
            container: 'body',
            content: '<dl>' +
                '<dt>Read</dt>' +
                    '<dd><ul><li>View preprint</li></ul></dd>' +
                '<dt>Read + Write</dt>' +
                    '<dd><ul><li>Read and write privileges</li> ' +
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
            this.get('model').addContributor(user.id, 'write', true, this.get('sendEmail'), undefined, undefined, true)
                .then(this._addContributor.bind(this))
                .catch(this._failAddContributor.bind(this));
        },
        // Adds unregistered contributor, then clears form and switches back to search view.
        // Should wait to transition until request has completed.
        addUnregisteredContributor(fullName, email) {
            if (fullName && email) {
                const res = this.get('model').addContributor(null, 'write', true, this.get('sendEmail'), fullName, email, true);
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
                    if (error.errors[0] && error.errors[0].detail) {
                        this.get('toast').error(error.errors[0].detail);
                    } else {
                        this.get('toast').error(this.get('i18n').t('submit.error_adding_unregistered_author'));
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
            if (this.get('currentUser').id === contrib.get('userId')) {
                this.get('metrics')
                    .trackEvent({
                        category: 'button',
                        action: 'click',
                        label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Confirm Remove Self from Preprint`,
                    });
            } else {
                this.get('metrics')
                    .trackEvent({
                        category: 'button',
                        action: 'click',
                        label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Remove Author`,
                    });
            }

            this.set('contributor', contrib);
            this.toggleProperty('removeButtonDisabled');
            this.model.removeContributor(contrib)
                .then(this._removeContributor.bind(this))
                .catch(this._failRemoveContributor.bind(this));
        },
        removeContributorConfirm() {
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Edit - Open remove self modal',
                });
            this.toggleProperty('showRemoveSelfModal');
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

            this.get('model').updateContributor(contributor, permission, '')
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
            this.get('model').updateContributor(contributor, '', isBibliographic)
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
    disabled.  Changing the isAdmin flag to false will remove many options on the
    contributor section. If the user is downgraded to write, they can still edit
    most of the page, but cannot update authors */
    modifiedSelf(contributor, permission, removed) {
        if (this.get('currentUser').id === contributor.get('userId')) {
            if (removed) {
                this.attrs.currentUserRemoved();
            } else if (permission !== 'admin') {
                this.set('isAdmin', false);
                if (permission === 'read') {
                    this.set('canEdit', false);
                }
            }
        }
    },
    /* Toggling this property, authorModification, updates several items on the page -
    disabling elements, enabling others, depending on what requests are permitted */
    toggleAuthorModification() {
        this.toggleProperty('authorModification');
    },

    _addContributor(res) {
        this.toggleAuthorModification();
        this.get('contributors').pushObject(res);
        this.get('toast').success(this.get('i18n').t('submit.preprint_author_added', {
            documentType: this.get('documentType'),
        }));
        this.highlightSuccessOrFailure(res.id, this, 'success');
    },

    _failAddContributor() {
        const user = this.get('user');

        this.get('toast').error(this.get('i18n').t('submit.error_adding_author'));
        this.highlightSuccessOrFailure(user.id, this, 'error');
        user.rollbackAttributes();
    },

    _searchView() {
        this.set('addState', 'searchView');
    },

    _removeContributor() {
        const contributor = this.get('contributor');
        this.set('showRemoveSelfModal', false);
        this.toggleProperty('removeButtonDisabled');
        this.toggleAuthorModification();
        this.get('contributors').removeObject(contributor);
        this.modifiedSelf(contributor, contributor.get('permission'), true);
        return this._currentUserModified(contributor) ? this.get('toast').success(this.get('i18n').t(
            'submit.preprint_self_removed',
            {
                documentType: this.get('documentType'),
            },
        )) : this.get('toast').success(this.get('i18n').t(
            'submit.preprint_author_removed',
            {
                documentType: this.get('documentType'),
            },
        ));
    },

    _currentUserModified(contributor) {
        return (this.get('currentUser').id === contributor.get('userId'));
    },

    _failRemoveContributor() {
        const contributor = this.get('contributor');
        this.toggleProperty('removeButtonDisabled');
        this.get('toast').error(this.get('i18n').t('submit.error_removing_author'));
        this.highlightSuccessOrFailure(contributor.id, this, 'error');
        contributor.rollbackAttributes();
    },

    _modifyAuthorPermission() {
        const contributor = this.get('contributor');
        const permission = this.get('permission');

        this.toggleAuthorModification();
        this.highlightSuccessOrFailure(contributor.id, this, 'success');
        this.modifiedSelf(contributor, permission, false);
    },

    _failModifyAuthorPermission() {
        const contributor = this.get('contributor');

        this.get('toast').error('Could not modify author permissions');
        this.highlightSuccessOrFailure(contributor.id, this, 'error');
        contributor.rollbackAttributes();
    },

    _successUpdateCitation() {
        const contributor = this.get('contributor');

        this.toggleAuthorModification();
        this.highlightSuccessOrFailure(contributor.id, this, 'success');
    },

    _failUpdateCitation() {
        const contributor = this.get('contributor');

        this.get('toast').error('Could not modify citation');
        this.highlightSuccessOrFailure(contributor.id, this, 'error');
        contributor.rollbackAttributes();
    },

    _sendHighlightSuccess() {
        const draggedContrib = this.get('draggedContrib');

        this.highlightSuccessOrFailure(draggedContrib.id, this, 'success');
    },

    _sendHighlightFailure() {
        const draggedContrib = this.get('draggedContrib');
        const originalOrder = this.get('contributors');

        this.highlightSuccessOrFailure(draggedContrib.id, this, 'error');
        this.set('contributors', originalOrder);
        this.get('toast').error('Could not reorder contributors');
        draggedContrib.rollbackAttributes();
    },

    _setSearchState() {
        const current = this.get('current');

        this.set('addState', 'searchView');
        this.set('currentPage', current);
    },

    _failSearchQuery() {
        this.get('toast').error('Could not perform search query.');
        this.highlightSuccessOrFailure('author-search-box', this, 'error');
    },
});
