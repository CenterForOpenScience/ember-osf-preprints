import Ember, { Logger } from 'ember';
import config from 'ember-get-config';

const providers = config.PREPRINTS.providers.slice(1);
const providerIds = providers.map(p => p.id);

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
        const {slug = ''} = transition.params.provider;
        const slugLower = slug.toLowerCase();

        this.store.find('preprint-provider', slug).then(() =>{
        if (providerIds.includes(slugLower)) {
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
        }
        ).catch(() =>{
                this.replaceWith('page-not-found');

            });
    },

    actions: {
        error(error) {
            Logger.error(error);

            // substate implementation when returning `true`
            return true;

        }
    }
});
