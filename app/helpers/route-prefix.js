import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

/**
 * @module ember-preprints
 * @submodule helpers
 */

/**
 * Needed for link-to for branded routing to get the correct route path
 *
 * @class route-prefix
 */
export default Helper.extend({
    theme: service(),

    onSubRouteChange: computed('theme.isSubRoute', function() {
        this.recompute();
    }),

    compute(params) {
        const route = params.join('');

        return this.get('theme.isSubRoute') ? `provider.${route}` : route;
    },
});
