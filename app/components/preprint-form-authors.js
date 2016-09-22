import Ember from 'ember';
import CpPanelBodyComponent from 'ember-collapsible-panel/components/cp-panel-body';
import { permissionSelector } from 'ember-osf/const/permissions';

export default CpPanelBodyComponent.extend({
    valid: Ember.computed.alias('newContributorId'),
    authorModification: false,
    // Permissions labels for dropdown
    permissionOptions: permissionSelector,
    parentContributorsAdded: false,
    // Returns list of user ids associated with current node
    currentContributorIds: Ember.computed('contributors', function() {
        var contribIds = [];
        this.get('contributors').forEach((contrib) => {
            contribIds.push(contrib.get('userId'));
        });
        return contribIds;
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
            return searchResults.meta.total;
        } else {
            return;
        }
    }),
    actions: {
        // Adds contributor then redraws view - addition of contributor may change which update/remove contributor requests are permitted
        addContributor(user) {
            this.attrs.addContributor(user.id, 'write', true, false, undefined, undefined, true).then((res) => {
                this.toggleAuthorModification();
                this.get('contributors').pushObject(res);
                this.highlightSuccessOrFailure(res.id, this, 'success');
            }, () => {
                this.get('toast').error('Could not add contributor.');
                this.highlightSuccessOrFailure(user.id, this, 'error');
                user.rollbackAttributes();
            });
        },
        // Adds all contributors from parent project to current component as long as they are not current contributors
        addContributorsFromParentProject() {
            this.set('parentContributorsAdded', true);
            var parentNode = this.get('parentNode');
            var contribPromises = [];
            parentNode.get('contributors').toArray().forEach(contributor => {
                if (this.get('currentContributorIds').indexOf(contributor.get('userId')) === -1) {
                    contribPromises.push(this.get('node').addContributor(contributor.get('userId'), contributor.get('permission'), contributor.get('bibliographic'), false).then((contrib) => {
                        this.get('contributors').pushObject(contrib);
                    }));
                }
            });
            Ember.RSVP.allSettled(contribPromises).then((array) => {
                this.toggleAuthorModification();
                var allFulfilled = true;
                array.forEach((stateObject) => {
                    if (stateObject.state === 'rejected') {
                        allFulfilled = false;
                    }
                });
                if (!allFulfilled) {
                    this.get('toast').error('Some contributors may not have been added.  Try adding manually.');
                }
            });
        },
        // Adds unregistered contributor, then clears form and switches back to search view.
        // Should wait to transition until request has completed.
        addUnregisteredContributor(fullName, email) {
            if (fullName && email) {
                let res = this.attrs.addContributor(null, 'write', true, false, fullName, email, true);
                res.then((contributor) => {
                    this.get('contributors').pushObject(contributor);
                    this.toggleAuthorModification();
                    this.set('addState', 'searchView');
                    this.set('fullName', '');
                    this.set('email', '');
                    this.highlightSuccessOrFailure(contributor.id, this, 'success');
                }, (error) => {
                    if (error.errors[0] && error.errors[0].detail && error.errors[0].detail.indexOf('is already a contributor') > -1) {
                        this.get('toast').error(error.errors[0].detail);
                    } else {
                        this.get('toast').error('Could not add unregistered contributor.');
                    }
                    this.highlightSuccessOrFailure('add-unregistered-contributor-form', this, 'error');
                });
            }
        },
        // Requests a particular page of user results
        findContributors(page) {
            var query = this.get('query');
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
            this.attrs.removeContributor(contrib).then(() => {
                this.toggleAuthorModification();
                this.removedSelfAsAdmin(contrib, contrib.get('permission'));
                this.get('contributors').removeObject(contrib);
            }, () => {
                this.get('toast').error('Could not remove author');
                this.highlightSuccessOrFailure(contrib.id, this, 'error');
                contrib.rollbackAttributes();
            });
        },
        // Updates contributor then redraws contributor list view - updating contributor
        // permissions may change which additional update/remove requests are permitted.
        updatePermissions(contributor, permission) {
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
            this.set('addState', 'searchView');
        },
        // Reorders contributors in UI then sends server request to reorder contributors. If request fails, reverts
        // contributor list in UI back to original.
        reorderItems(itemModels, draggedContrib) {
            var originalOrder = this.get('contributors');
            this.set('contributors', itemModels);
            var newIndex = itemModels.indexOf(draggedContrib);
            this.attrs.reorderContributors(draggedContrib, newIndex, itemModels).then(() => {
                this.highlightSuccessOrFailure(draggedContrib.id, this, 'success');
            }, () => {
                this.highlightSuccessOrFailure(draggedContrib.id, this, 'error');
                this.set('contributors', originalOrder);
                this.get('toast').error('Could not reorder contributors');
                draggedContrib.rollbackAttributes();
            });
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
    /**
    * If user removes their own admin permissions, many things on the page must become
    * disabled.  Changing the isAdmin flag to false will remove many of the options
    * on the page.
    */
    removedSelfAsAdmin(contributor, permission) {
        if (this.get('currentUser').id === contributor.get('userId') && permission !== 'ADMIN') {
            this.set('isAdmin', false);
        }
    },
    /**
    * Toggling this property, authorModification, updates several items on the page - disabling elements, enabling
    * others, depending on what requests are permitted
    */
    toggleAuthorModification() {
        this.toggleProperty('authorModification');
    }
});
