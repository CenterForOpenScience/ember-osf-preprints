import Ember from 'ember';
import CpPanelBodyComponent from 'ember-collapsible-panel/components/cp-panel-body';
import { permissionSelector } from 'ember-osf/const/permissions';
import Analytics from 'ember-osf/mixins/analytics';
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Displays current preprint authors and their permissions/bibliographic information. Allows user to search for
 * authors, add authors, edit authors permissions/bibliographic information, and remove authors.  Actions
 * that are not allowed are disabled (for example, you cannot remove the sole bibliographic author).
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
    i18n: Ember.inject.service(),
    valid: Ember.computed.alias('newContributorId'),
    authorModification: false,
    currentPage: 1,
    // Permissions labels for dropdown
    permissionOptions: permissionSelector,
    parentContributorsAdded: false,
    // Returns list of user ids associated with current node
    currentContributorIds: Ember.computed('contributors', function() {
        let contribIds = [];
        this.get('contributors').forEach((contrib) => {
            contribIds.push(contrib.get('userId'));
        });
        return contribIds;
    }),
    // In Add mode, contributors are emailed on creation of preprint. In Edit mode,
    // contributors are emailed as soon as they are added to preprint.
    sendEmail: Ember.computed('editMode', function() {
        return this.get('editMode') ? 'preprint' : false;
    }),
    numParentContributors: Ember.computed('parentNode', function() {
        if (this.get('parentNode')) {
            return this.get('parentNode').get('contributors').get('length');
        } else {
            return 0;
        }
    }),
    addState: 'emptyView', // There are 3 view states on left side of Authors panel. Default state just shows search bar.
    query: null,
    // Total contributor search results
    totalSearchResults: Ember.computed('searchResults.[]', function() {
        let searchResults = this.get('searchResults');
        if (searchResults && searchResults.links) {
            return searchResults.meta.pagination.total;
        } else {
            return;
        }
    }),
    // Total pages of contributor search results
    pages: Ember.computed('searchResults.[]', function() {
        let searchResults = this.get('searchResults');
        if (searchResults && searchResults.links) {
            return searchResults.meta.total_pages;
        } else {
            return;
        }
    }),
    actions: {
        // Adds contributor then redraws view - addition of contributor may change which update/remove contributor requests are permitted
        addContributor(user) {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Add Author`
                });
            this.attrs.addContributor(user.id, 'write', true, this.get('sendEmail'), undefined, undefined, true).then((res) => {
                this.toggleAuthorModification();
                this.get('contributors').pushObject(res);
                this.get('toast').success(this.get('i18n').t('submit.preprint_author_added'));
                this.highlightSuccessOrFailure(res.id, this, 'success');
            }, () => {
                this.get('toast').error(this.get('i18n').t('submit.error_adding_author'));
                this.highlightSuccessOrFailure(user.id, this, 'error');
                user.rollbackAttributes();
            });
        },
        // Adds all contributors from parent project to current component as long as they are not current contributors
        addContributorsFromParentProject() {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `Submit - Bulk Add Contributors From Parent`
                });
            this.set('parentContributorsAdded', true);
            let contributorsToAdd = Ember.A();
            this.get('parentContributors').toArray().forEach(contributor => {
                if (this.get('currentContributorIds').indexOf(contributor.get('userId')) === -1) {
                    contributorsToAdd.push({
                        permission: contributor.get('permission'),
                        bibliographic: contributor.get('bibliographic'),
                        userId: contributor.get('userId'),
                    });
                }
            });
            this.attrs.addContributors(contributorsToAdd, this.get('sendEmail'))
                .then((contributors) => {
                    contributors.map((contrib) => {
                        this.get('contributors').pushObject(contrib);
                    });
                    this.toggleAuthorModification();
                })
                .catch(() => {
                    this.get('toast').error('Some contributors may not have been added. Try adding manually.');
                });
        },
        // Adds unregistered contributor, then clears form and switches back to search view.
        // Should wait to transition until request has completed.
        addUnregisteredContributor(fullName, email) {
            if (fullName && email) {
                let res = this.attrs.addContributor(null, 'write', true, this.get('sendEmail'), fullName, email, true);
                res.then((contributor) => {
                    this.get('contributors').pushObject(contributor);
                    this.toggleAuthorModification();
                    this.set('addState', 'searchView');
                    this.set('fullName', '');
                    this.set('email', '');
                    this.get('toast').success(this.get('i18n').t('submit.preprint_unregistered_author_added'));
                    this.highlightSuccessOrFailure(contributor.id, this, 'success');
                }, (error) => {
                    if (error.errors[0] && error.errors[0].detail && error.errors[0].detail.indexOf('is already a contributor') > -1) {
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
            let query = this.get('query');
            if (query) {
                this.attrs.findContributors(query, page).then(() => {
                    this.set('addState', 'searchView');
                }, () => {
                    this.get('toast').error('Could not perform search query.');
                    this.highlightSuccessOrFailure('author-search-box', this, 'error');
                });
            }
        },
        // Removes contributor then redraws contributor list view - removal of contributor may change
        // which additional update/remove requests are permitted.
        removeContributor(contrib) {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Remove Author`
                });
            this.attrs.removeContributor(contrib).then(() => {
                this.toggleAuthorModification();
                this.removedSelfAsAdmin(contrib, contrib.get('permission'));
                this.get('contributors').removeObject(contrib);
                this.get('toast').success(this.get('i18n').t('submit.preprint_author_removed'));
            }, () => {
                this.get('toast').error(this.get('i18n').t('submit.error_adding_author'));
                this.highlightSuccessOrFailure(contrib.id, this, 'error');
                contrib.rollbackAttributes();
            });
        },
        // Updates contributor then redraws contributor list view - updating contributor
        // permissions may change which additional update/remove requests are permitted.
        updatePermissions(contributor, permission) {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'dropdown',
                    action: 'select',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Change Author Permissions`
                });
            this.attrs.editContributor(contributor, permission, '').then(() => {
                this.toggleAuthorModification();
                this.highlightSuccessOrFailure(contributor.id, this, 'success');
                this.removedSelfAsAdmin(contributor, permission);
            }, () => {
                this.get('toast').error('Could not modify author permissions');
                this.highlightSuccessOrFailure(contributor.id, this, 'error');
                contributor.rollbackAttributes();
            });
        },
        // Updates contributor then redraws contributor list view - updating contributor
        // bibliographic info may change which additional update/remove requests are permitted.
        updateBibliographic(contributor, isBibliographic) {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'checkbox',
                    action: 'select',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Update Bibliographic Author`
                });
            this.attrs.editContributor(contributor, '', isBibliographic).then(() => {
                this.toggleAuthorModification();
                this.highlightSuccessOrFailure(contributor.id, this, 'success');
            }, () => {
                this.get('toast').error('Could not modify citation');
                this.highlightSuccessOrFailure(contributor.id, this, 'error');
                contributor.rollbackAttributes();
            });
        },
        // There are 3 view states on left side of Authors panel.  This switches to add unregistered contrib view.
        unregisteredView() {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Go to Add Author by Email Form`
                });
            this.set('addState', 'unregisteredView');
        },
        // There are 3 view states on left side of Authors panel.  This switches to searching contributor results view.
        searchView() {
            this.set('addState', 'searchView');
            this.set('fullName', '');
            this.set('email', '');
        },
        // There are 3 view states on left side of Authors panel.  This switches to empty view and clears search results.
        resetfindContributorsView() {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Cancel Add Author By Email`
                });
            this.set('addState', 'searchView');
        },
        // Reorders contributors in UI then sends server request to reorder contributors. If request fails, reverts
        // contributor list in UI back to original.
        reorderItems(itemModels, draggedContrib) {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'div',
                    action: 'drag',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Reorder Authors`
                });
            let originalOrder = this.get('contributors');
            this.set('contributors', itemModels);
            let newIndex = itemModels.indexOf(draggedContrib);
            this.attrs.reorderContributors(draggedContrib, newIndex, itemModels).then(() => {
                this.highlightSuccessOrFailure(draggedContrib.id, this, 'success');
            }, () => {
                this.highlightSuccessOrFailure(draggedContrib.id, this, 'error');
                this.set('contributors', originalOrder);
                this.get('toast').error('Could not reorder contributors');
                draggedContrib.rollbackAttributes();
            });
        },
        // Action used by the pagination-pager component to the handle user-click event.
        pageChanged(current) {
            let query = this.get('query');
            if (query) {
                this.attrs.findContributors(query, current).then(() => {
                    this.set('addState', 'searchView');
                    this.set('currentPage', current);
                })
                .catch(() => {
                        this.get('toast').error('Could not perform search query.');
                        this.highlightSuccessOrFailure('author-search-box', this, 'error');
                    });
            }
        }
    },
    // TODO find alternative to jquery selectors. Temporary popover content for authors page.
    didInsertElement: function() {
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
                '</dl>'
        });
        this.$('#bibliographic-popover').popover({
            container: 'body',
            content: 'Only checked authors will be included in preprint citations. ' +
            'Authors not in the citation can read and modify the preprint as normal.'
        });
        this.$('#author-popover').popover({
            container: 'body',
            content: 'Preprints must have at least one registered administrator and one author showing in the citation at all times.  ' +
            'A registered administrator is a user who has both confirmed their account and has administrator privileges.'
        });
    },

    /* If user removes their own admin permissions, many things on the page must become
    disabled.  Changing the isAdmin flag to false will remove many of the options
    on the page. */
    removedSelfAsAdmin(contributor, permission) {
        if (this.get('currentUser').id === contributor.get('userId') && permission !== 'ADMIN') {
            this.set('isAdmin', false);
        }
    },
    /* Toggling this property, authorModification, updates several items on the page - disabling elements, enabling
    others, depending on what requests are permitted */
    toggleAuthorModification() {
        this.toggleProperty('authorModification');
    }
});
