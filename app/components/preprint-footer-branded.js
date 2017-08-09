import Ember from 'ember';
import Analytics from 'ember-osf/mixins/analytics';
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Preprints footer - can have branding for a particular provider - use in application.hbs to drop footer onto every page
 *
 * Sample usage:
 * ```handlebars
 * {{preprint-footer-branded
 *  model=theme.provider
 *}}
 * ```
 * @class preprint-footer-branded
 */
export default Ember.Component.extend(Analytics, {
    theme: Ember.inject.service(),
    classNames: ['branded-footer']
});
