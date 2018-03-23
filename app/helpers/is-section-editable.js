import { helper } from '@ember/component/helper';

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
export function isSectionEditable(params/* , hash */) {
    const section = params[0];
    const uneditableSections = ['Submit', 'location_of_preprint', 'Update'];
    return !(uneditableSections.includes(section));
}

export default helper(isSectionEditable);
