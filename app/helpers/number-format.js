import Ember from 'ember';
/**
 * @module ember-preprints
 * @submodule helpers
 */

/**
  * numberFormat helper. Transforms 3500 into 3,500 for example, if in US English locale.
  *
  * @class numberFormat.
  * @param {Integer} element
  * @return {String} Return formatted string.
  */
export function numberFormat(params/*, hash*/) {
    const [number] = params;

    return number.toLocaleString();
}

export default Ember.Helper.helper(numberFormat);
