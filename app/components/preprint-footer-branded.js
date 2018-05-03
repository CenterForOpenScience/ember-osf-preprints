import Component from '@ember/component';
import { inject as service } from '@ember/service';
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
export default Component.extend(Analytics, {
    theme: service(),
    classNames: ['branded-footer']
});
