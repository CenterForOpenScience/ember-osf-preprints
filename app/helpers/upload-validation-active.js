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
 * @param {Boolean} nodeLocked Has node been locked? After upload section
 * created in add mode or form in edit mode, node is locked.
 * @param {Boolean} hasOpened Has form section been opened?
 * @return {Boolean} uploadValidationActive Should validation be active on
 * upload section (namely, should save button have a color?)
 */
export function uploadValidationActive(params/* , hash */) {
    const [editMode, nodeLocked, hasOpened] = params;
    return editMode ? nodeLocked && hasOpened : nodeLocked;
}

export default helper(uploadValidationActive);
