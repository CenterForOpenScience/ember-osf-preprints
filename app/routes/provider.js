import Ember from 'ember';
import config from 'ember-get-config';
import getRedirectUrl from '../utils/get-redirect-url';

const providers = config.PREPRINTS.providers.slice(1);

/**
 * @module ember-preprints
 * @submodule routes
 */

/**
 * @class Provider Route Handler
 */
export default Ember.Route.extend({
    theme: Ember.inject.service(),

    beforeModel(transition) {
        const {slug} = transition.params.provider;
        const slugLower = (slug || '').toLowerCase();
        this.store
            .findAll('preprint-provider')
            .then(p => {
                const providerList = p.filter(function (item){return (item.id !== 'osf');}).map(provider => {
                    return provider.get('id');
                });

                if (providerList.includes(slugLower)) {
                    const {domain} = providers.find(provider => provider.id === slugLower) || {};

                    // This should be caught by the proxy, but we'll redirect just in case it is not.
                    if (domain) {
                        window.location.replace(
                            getRedirectUrl(window.location, domain, slug)
                        );

                        return;
                    }

                    if (slugLower !== slug) {
                        const {pathname} = window.location;
                        const pathRegex = new RegExp(`^/preprints/${slug}`);

                        window.location.pathname = pathname.replace(
                            pathRegex,
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

            });


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
