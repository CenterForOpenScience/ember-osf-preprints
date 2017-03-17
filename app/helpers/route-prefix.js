import Ember from 'ember';

/**
 * @module ember-preprints
 * @submodule helpers
 */

/**
 * Needed for link-to for branded routing to get the correct route path
 *
 * @class route-prefix
 */
export default Ember.Helper.extend({
    theme: Ember.inject.service(),

    onSubRouteChange: Ember.observer('theme.isSubRoute', function() {
        this.recompute();
    }),

    compute(params) {
        const route = params.join('');

        return this.get('theme.isSubRoute') ? `provider.${route}` : route;
    }
});
