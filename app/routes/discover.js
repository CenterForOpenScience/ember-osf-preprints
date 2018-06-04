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
            .query('preprint-provider', { reload: true })
            .then(this._loadAllProviders.bind(this));
    },
    setupController(controller, { preprintProviders, meta }) {
        this._super(controller, preprintProviders);
        controller.set('meta', meta);
    },
    actions: {
        willTransition() {
            const controller = this.controllerFor('discover');
            controller._clearFilters();
            controller._clearQueryString();
        },
    },
    _loadAllProviders(providers) {
        return {
            preprintProviders: providers,
            meta: providers.get('meta'),
        };
    },
});
