import Route from '@ember/routing/route';
import Analytics from 'ember-osf/mixins/analytics';

import ResetScrollMixin from '../mixins/reset-scroll';
/**
 * @module ember-preprints
 * @submodule routes
 */

/**
 * Loads all preprint providers to search page
 * @class Discover Route Handler
 */
export default Route.extend(Analytics, ResetScrollMixin, {
    queryParams: {
        queryString: {
            replace: true,
        },
    },
    model() {
        return this
            .get('store')
            .findAll('preprint-provider', { reload: true });
    },
    actions: {
        willTransition() {
            const controller = this.controllerFor('discover');
            controller._clearFilters();
            controller._clearQueryString();
        },
    },
});
