import Ember from 'ember';
import CpPanelBodyComponent from 'ember-collapsible-panel/components/cp-panel-body';
import PreprintFormFieldMixin from '../mixins/preprint-form-field';
import permissions from 'ember-osf/const/permissions';

export default CpPanelBodyComponent.extend(PreprintFormFieldMixin, {
    READ: permissions.READ,
    WRITE: permissions.WRITE,
    ADMIN: permissions.ADMIN,
    permissionChanges: {},
    bibliographicChanges: {},
    valid: Ember.computed.alias('newContributorId'),
    actions: {
        addContributor(userId, permission, isBibliographic) {
            this.sendAction('addContributor', userId, permission, isBibliographic);
        },
        removeContributor(contrib) {
            this.sendAction('removeContributor', contrib);
        },
        permissionChange(contributor, permission) {
            this.set(`permissionChanges.${contributor.id}`, permission.toLowerCase());
        },
        bibliographicChange(contributor, isBibliographic) {
            this.set(`bibliographicChanges.${contributor.id}`, isBibliographic);
        },
        updateContributors() {
            this.sendAction(
                'editContributors',
                this.get('contributors'),
                this.get('permissionChanges'),
                this.get('bibliographicChanges')
            );
        }
    }
});
