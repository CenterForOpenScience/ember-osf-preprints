import Component from '@ember/component';

/**
 * @module ember-osf-preprints
 * @submodule components
 */

/**
 * Customizes the collapsible panel header.
 *
 * Sample usage:
 * ```handlebars
 * {{preprint-form-header}}
 *    saved=hasSaved
 *    valid=isValid
 * }}
 * ```
 * @class preprint-form-header
 * */
export default Component.extend({
    tagName: '',

    // Variables to pass in
    valid: false,
    saved: false,
});
