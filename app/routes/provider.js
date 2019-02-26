import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import DS from 'ember-data';
import config from 'ember-get-config';

/**
 * @module ember-preprints
 * @submodule routes
 */

/**
 * @class Provider Route Handler
 */
export default Route.extend({
    theme: service(),
    slug: '',
    slugLower: null,

    beforeModel(transition) {
        const { slug = '' } = transition.params.provider;
        const slugLower = slug.toLowerCase();

        this.set('slug', slug);
        this.set('slugLower', slugLower);

        return this.get('store').findRecord(
            'preprint-provider',
            slugLower,
        ).then(this._getThemeId.bind(this));
    },

    actions: {
        // Error handler to handle the error occured in the beforeModel hook
        // It it hits this error handler, that means the `findRecord` in the beforeModel fails
        // Or some child routes' error in route lifecycle hooks was bubbled up here
        error(error) {
            const slug = this.get('slug');
            this.set('theme.id', config.PREPRINTS.defaultProvider);

            // If the `findRecord` fails and the slug is a five-letter id
            if (slug.length === 5) {
                // It is possible that the user is trying to go to a preprint detail page, not a
                // provider landing page
                // So we try to transition to a preprint detail view with the slug as preprint id
                return this.transitionTo('content', slug);
            } else if (error && !(error instanceof DS.AbortError)) {
                // Otherwise, if the the error is not a AbortError (meaning no connection)
                // We transition to `page-not-found`
                return this.intermediateTransitionTo('page-not-found');
            } else {
                // If it is a AbortError
                // We bubble the error up to the parent route's error handler
                return true;
            }
        },
    },
    _getThemeId() {
        const slug = this.get('slug');
        const slugLower = this.get('slugLower');
        const { pathname } = window.location;
        const pathRegex = new RegExp(`^/preprints/${slug}`);

        if (slug !== slugLower) {
            window.location.pathname = pathname.replace(
                pathRegex,
                `/preprints/${slugLower}`,
            );
        }
        this.set('theme.id', slugLower);
    },
});
