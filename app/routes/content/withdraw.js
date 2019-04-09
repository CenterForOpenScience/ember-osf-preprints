import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { task } from 'ember-concurrency';
import CasAuthenticatedRouteMixin from 'ember-osf/mixins/cas-authenticated-route';
import ConfirmationMixin from 'ember-onbeforeunload/mixins/confirmation';
import permissions from 'ember-osf/const/permissions';
import config from 'ember-get-config';

/**
 * @module ember-preprints
 * @submodule routes
 */

/**
 * Creates a preprint-request record
 * @class Withdraw Route Handler
 */
export default Route.extend(ConfirmationMixin, CasAuthenticatedRouteMixin, { // eslint-disable-line max-len
    store: service(),
    i18n: service(),
    theme: service(),
    currentUser: service(),
    preprint: null,

    afterModel(preprint) {
        this.set('preprint', preprint);
        if (preprint.get('dateWithdrawn') || preprint.get('reviewsState') === 'rejected') {
            // if this preprint is withdrawn, then redirect to 'forbidden' page
            this.replaceWith('forbidden');
        }
        return preprint.get('provider')
            .then(this._getProviderInfo.bind(this))
            .then(this._getContributors.bind(this))
            .then(this.get('fetchWithdrawalRequest').perform());
    },
    renderTemplate() {
        this.render('content.withdraw');
    },
    fetchWithdrawalRequest: task(function* () {
        let withdrawalRequest = yield this.get('preprint.requests');
        withdrawalRequest = withdrawalRequest.toArray();
        if (withdrawalRequest.length >= 1 && withdrawalRequest[0].get('machineState') === 'pending') {
            // If there is a pending withdrawal request, then redirect to 'forbidden' page
            this.replaceWith('forbidden');
        }
    }),
    _getProviderInfo(provider) {
        const preprint = this.get('preprint');
        const providerId = provider.get('id');
        const themeId = this.get('theme.id');
        const isOSF = providerId === 'osf';

        // If we're not on the proper branded site, redirect.
        if (themeId !== providerId) {
            window.location.replace(`${config.OSF.url}${isOSF ? '' : `preprints/${providerId}/`}${preprint.get('id')}/withdraw/`);
            return Promise.reject();
        }
    },

    _getContributors() {
        const userPermissions = this.get('preprint.currentUserPermissions') || [];
        if (!userPermissions.includes(permissions.ADMIN)) {
            this.replaceWith('forbidden'); // Non-admin trying to access withdraw form.
        }
    },
});
