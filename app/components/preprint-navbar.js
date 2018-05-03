import Component from '@ember/component';
import Analytics from 'ember-osf/mixins/analytics';
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Preprint navbar - use in application.hbs to drop navbar onto every page
 *
 * Sample usage:
 * ```handlebars
 * {{preprint-navbar}}
 *
 * ```
 * @class preprint-navbar
 */
export default Component.extend(Analytics, {
});
