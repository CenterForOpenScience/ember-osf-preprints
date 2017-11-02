import Ember from 'ember';
import ResetScrollMixin from '../../mixins/reset-scroll';
import SetupSubmitControllerMixin from '../../mixins/setup-submit-controller';
import Analytics from 'ember-osf/mixins/analytics';
import config from 'ember-get-config';
import permissions from 'ember-osf/const/permissions';
import ConfirmationMixin from 'ember-onbeforeunload/mixins/confirmation';

/**
 * @module ember-preprints
 * @submodule routes
 */

/**
 * Fetches current preprint. Redirects to preprint provider route if necessary.
 * @class Edit Route Handler
 */
export default Ember.Route.extend(ConfirmationMixin, Analytics, ResetScrollMixin, SetupSubmitControllerMixin, {
    theme: Ember.inject.service(),
    headTagsService: Ember.inject.service('head-tags'),
    currentUser: Ember.inject.service('currentUser'),
    confirmationMessage: 'Are you sure you want to abandon changes to this preprint?', // Confirmation message when navigating away from preprint

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
        return preprint.get('provider')
            .then(provider => {
                const providerId = provider.get('id');
                const themeId = this.get('theme.id');
                const isOSF = providerId === 'osf';

                // If we're on the proper branded site, stay here.
                if (themeId === providerId)
                    return preprint.get('node');

                window.location.replace(`${config.OSF.url}${isOSF ? '' : `preprints/${providerId}/`}${preprint.get('id')}/edit/`);
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
    isPageDirty() {
        // If true, shows a confirmation message when leaving the page
        // True if the user has any unsaved changes
        return this.controller.get('hasDirtyFields');
    }
});
