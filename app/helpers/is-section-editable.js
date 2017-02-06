import Ember from 'ember';

/**
 * @module ember-preprints
 * @submodule helpers
 */

/**
 * isSectionEditable helper - determines if form section can be edited.
 *
 * @class isSectionEditable
 * @param {String} section form section name
 * @return {Boolean} Is this section editable?
 */
export function isSectionEditable(params/*, hash*/) {
    let section = params[0];
    let uneditableSections = ['Submit', 'location_of_preprint', 'Update'];
    return !(uneditableSections.includes(section));
}

export default Ember.Helper.helper(isSectionEditable);
