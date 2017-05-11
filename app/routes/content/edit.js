import Ember from 'ember';
import ResetScrollMixin from '../../mixins/reset-scroll';
import SetupSubmitControllerMixin from '../../mixins/setup-submit-controller';
import Analytics from 'ember-osf/mixins/analytics';
import config from 'ember-get-config';
import permissions from 'ember-osf/const/permissions';
import getRedirectUrl from '../../utils/get-redirect-url';

const {PREPRINTS: {providers}} = config;

/**
 * @module ember-preprints
 * @submodule routes
 */

/**
 * Fetches current preprint. Redirects to preprint provider route if necessary.
 * @class Edit Route Handler
 */
export default Ember.Route.extend(Analytics, ResetScrollMixin, SetupSubmitControllerMixin, {
    theme: Ember.inject.service(),
    headTagsService: Ember.inject.service('head-tags'),
    currentUser: Ember.inject.service('currentUser'),

    editMode: true,

    setup() {
        // Overrides setup method.  If query param /?edit is present, uses 'submit' controller instead.
        this.set('controllerName', 'submit');
        return this._super(...arguments);
    },
    renderTemplate() {
        // Overrides renderTemplate method.  If query param /?edit is present, uses 'submit' template instead.
        this.render('submit');
    },

    setupController(controller, model) {
        // Runs setupController for 'submit'
        this.setupSubmitController(controller, model);

        return this._super(...arguments);
    },
    afterModel(preprint) {
        const {location: {origin}} = window;

        return preprint.get('provider')
            .then(provider => {
                const providerId = provider.get('id');
                const themeId = this.get('theme.id');
                const isOSF = providerId === 'osf';

                // If we're on the proper branded site, stay here.
                if ((!themeId && isOSF) || themeId === providerId)
                    return preprint.get('node');

                // Otherwise, find the correct provider and redirect
                const configProvider = providers.find(p => p.id === providerId);

                if (!configProvider)
                    throw new Error('Provider is not configured properly. Check the Ember configuration.');

                const {domain} = configProvider;
                const urlParts = [];

                // Provider with a domain
                if (this.get('theme.isDomain') || domain) {
                    urlParts.push(getRedirectUrl(window.location, domain));
                // Provider without a domain
                } else {
                    urlParts.push(origin);

                    if (!isOSF)
                        urlParts.push('preprints', providerId);

                    urlParts.push(preprint.get('id'));
                }

                const url = urlParts.join('/').replace(/\/\/$/, '/');
                window.location.replace(url);

                return Promise.reject();
            })
            .then(node => {
                this.set('node', node);

                const userPermissions = this.get('node.currentUserPermissions') || [];

                if (!userPermissions.includes(permissions.ADMIN)) {
                    this.replaceWith('forbidden'); // Non-admin trying to access edit form.
                }
            });
    },
});
