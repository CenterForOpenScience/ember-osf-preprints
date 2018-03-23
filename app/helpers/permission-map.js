import { helper } from '@ember/component/helper';

import { permissionSelector } from 'ember-osf/const/permissions';
/**
 * @module ember-preprints
 * @submodule helpers
 */

/**
 * permissionMap helper.  Maps short form of the contributor's permissions
 * passed in params to the long form.
 *
 * @class permissionMap
 * @param {String} permission Short form of permission
 * @return {String} permission Long form of permission
 */
export function permissionMap(params/* , hash */) {
    const map = {};
    for (let i = 0; i < permissionSelector.length; i++) {
        map[permissionSelector[i].value] = permissionSelector[i].text;
    }
    const permission = params[0];
    return map[permission];
}

export default helper(permissionMap);
