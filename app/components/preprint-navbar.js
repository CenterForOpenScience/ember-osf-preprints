import Ember from 'ember';
import Analytics from '../mixins/analytics';

/**
 * Preprint navbar - use in application.hbs to drop navbar onto every page
 *
 * Sample usage:
 * ```handlebars
 * {{preprint-navbar}}
 *
 * ```
 * @class preprint-navbar
 * @namespace component
 */
export default Ember.Component.extend(Analytics, {
});
