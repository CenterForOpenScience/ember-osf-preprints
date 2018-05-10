import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
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
        const slug = transition.params.provider;
        const slugLower = slug.toLowerCase();

        this.set('slug', slug);
        this.set('slugLower', slugLower);

        return this.get('store').findRecord(
            'preprint-provider',
            slugLower,
        ).then(this._getThemeId.bind(this)).catch(this._getPageNotFound.bind(this));
    },

    actions: {
        error(error) {
            console.error(error); // eslint-disable-line no-console
            return true;
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

    _getPageNotFound() {
        const slug = this.get('slug');
        this.set('theme.id', config.PREPRINTS.defaultProvider);

        if (slug.length === 5) {
            this.transitionTo('content', slug);
        } else {
            this.replaceWith('page-not-found');
        }
    },
});
