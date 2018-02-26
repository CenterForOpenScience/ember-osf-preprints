import { inject } from '@ember/service';
import Component from '@ember/component';
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
export default Component.extend(Analytics, {
    theme: inject()
});
