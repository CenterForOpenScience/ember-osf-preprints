import Ember from 'ember';
import config from 'ember-get-config';

/**
 * @module ember-preprints
 * @submodule routes
 */

/**
 * @class Provider Route Handler
 */
export default Ember.Route.extend({
    theme: Ember.inject.service(),

    providerIds: config.PREPRINTS.providers
        .slice(1)
        .map(provider => provider.id),

    beforeModel(transition) {
        const {slug} = transition.params.provider;
        const slugLower = (slug || '').toLowerCase();

        if (this.get('providerIds').includes(slugLower)) {
            if (slugLower !== slug) {
                const {pathname} = window.location;
                window.location.pathname = pathname.replace(
                    new RegExp(`^/preprints/${slug}`),
                    `/preprints/${slugLower}`
                );
            }

            this.set('theme.id', slug);
        } else {
            this.set('theme.id', config.PREPRINTS.defaultProvider);

            if (slug.length === 5) {
                this.transitionTo('content', slug);
            } else {
                this.replaceWith('page-not-found');
            }
        }
    },

    actions: {
        error(error) {
            // Manage your errors
            Ember.onerror(error);

            // substate implementation when returning `true`
            return true;

        }
    }
});
