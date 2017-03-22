import Ember from 'ember';
import ResetScrollMixin from '../../mixins/reset-scroll';
import SetupSubmitControllerMixin from '../../mixins/setup-submit-controller';
import Analytics from '../../mixins/analytics';
// import config from 'ember-get-config';
// import loadAll from 'ember-osf/utils/load-relationship';
import permissions from 'ember-osf/const/permissions';

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
        const {origin, search} = window.location;

        return preprint.get('provider')
            .then(provider => {
                const providerId = provider.get('id');
                const themeId = this.get('theme.id');
                const isOSF = providerId === 'osf';

                // If we're on the proper branded site, stay here.
                if ((!themeId && isOSF) || themeId === providerId)
                    return Promise.all([
                        provider,
                        preprint.get('node')
                    ]);

                // Otherwise, redirect to the proper branded site.
                // Hard redirect instead of transition, in anticipation of Phase 2 where providers will have their own domains.
                const urlParts = [
                    origin
                ];

                if (!isOSF)
                    urlParts.push('preprints', providerId);

                urlParts.push(preprint.get('id'), 'edit', search);

                const url = urlParts.join('/');

                window.history.replaceState({}, document.title, url);
                window.location.replace(url);

                return Promise.reject();
            })
            .then(([provider, node]) => {
                this.set('node', node);

                const userPermissions = this.get('node.currentUserPermissions') || [];

                if (!userPermissions.includes(permissions.ADMIN)) {
                    this.replaceWith('forbidden'); // Non-admin trying to access edit form.
                }
            });
    },
});
