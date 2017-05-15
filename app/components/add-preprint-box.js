import Ember from 'ember';
import Analytics from 'ember-osf/mixins/analytics';

/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Add preprint box - Component of portion of preprints discover page - asks users if they want to create a preprint
 *
 * Sample usage:
 * ```handlebars
 * {{add-preprint-box
 *}}
 * ```
 * @class add-preprint-box
 */
export default Ember.Component.extend(Analytics, {
    theme: Ember.inject.service()
});
