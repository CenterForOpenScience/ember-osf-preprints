import { isArray } from '@ember/array';
import Route from '@ember/routing/route';
import DS from 'ember-data';

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
            if (error && !(error instanceof DS.AbortError)
                && error.errors && isArray(error.errors)) {
                // If  the error is not a AbortError (no connection), we handle it here.
                const { detail } = error.errors[0];
                const page = handlers.get(detail) || 'page-not-found';
                return this.intermediateTransitionTo(page);
            } else {
                // Otherwise, we bubble it to the error handler in our parent route.
                return true;
            }
        },
    },
});
