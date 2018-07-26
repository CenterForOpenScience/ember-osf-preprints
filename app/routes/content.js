import { isArray } from '@ember/array';
import Route from '@ember/routing/route';

// Error handling for API
const handlers = new Map([
    // format: ['Message detail', 'page']
    ['Authentication credentials were not provided.', 'page-not-found'], // 401
    ['You do not have permission to perform this action.', 'page-not-found'], // 403
    ['Not found.', 'page-not-found'], // 404
    ['The requested node is no longer available.', 'resource-deleted'], // 410
]);

/**
 * @module ember-preprints
 * @submodule routes
 */

/**
 * @class Content Route Handler
 */
export default Route.extend({
    model(params) {
        return this
            .store
            .findRecord('preprint', params.preprint_id);
    },
    actions: {
        error(error) {
            // Handle API Errors
            if (error && error.errors && isArray(error.errors)) {
                const { detail } = error.errors[0];
                const page = handlers.get(detail) || 'page-not-found';

                return this.intermediateTransitionTo(page);
            }
        },
    },
});
