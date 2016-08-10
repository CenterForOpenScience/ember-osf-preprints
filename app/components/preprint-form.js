import Ember from 'ember';
import CpPanelsComponent from 'ember-collapsible-panel/components/cp-panels';

export default CpPanelsComponent.extend({
    store: Ember.inject.service(),
    elementId: 'preprint-form',
    accordion: true,
    _names: ['upload', 'basics', 'subjects', 'authors', 'submit'].map(str => str.capitalize()),
    valid: new Ember.Object(),
    actions: {
        verify(name, state) {
            this.get('valid').set(name, state);
        },
        addContributor(userId) {
            this.sendAction('addContributor', userId, 'write', true);
        },
        addUnregisteredContributor(fullName, email) {
            let res = this.attrs.addUnregisteredContributor(fullName, email, 'write', true);
        },
        findContributors(query, page) {
            this.sendAction('findContributors', query, page);

        },
        removeContributor(contrib) {
            this.sendAction('removeContributor', contrib);
        },
        updatePermissions(contributor, permission) {
            this.sendAction(
                'editContributors',
                this.get('contributors'),
                this.get('permissionChanges'),
                {}
            );
        },
        updateBibliographic(contributor, isBibliographic) {
            this.sendAction(
                'editContributors',
                this.get('contributors'),
                {},
                this.get('bibliographicChanges')
            );
        },
        editContributors(contributors, permissions, bibliographic) {
            this.sendAction('editContributors', contributors, permissions, bibliographic);
        }
    }
});
