import { helper } from '@ember/component/helper';

/**
 * @module ember-preprints
 * @submodule helpers
 */

/**
 * uploadValidationActive helper.
 *
 * @class uploadValidationActive
 * @param {Boolean} editMode Is submit form in edit mode?
 * @param {Boolean} preprintLocked Has preprint been locked? After upload section
 * created in add mode or form in edit mode, preprint is locked.
 * @param {Boolean} hasOpened Has form section been opened?
 * @return {Boolean} uploadValidationActive Should validation be active on
 * upload section (namely, should save button have a color?)
 */
export function uploadValidationActive(params/* , hash */) {
    const [editMode, preprintLocked, hasOpened] = params;
    return editMode ? preprintLocked && hasOpened : preprintLocked;
}

export default helper(uploadValidationActive);
