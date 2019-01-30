import { helper } from '@ember/component/helper';

/**
 * @module ember-preprints
 * @submodule helpers
 */

/**
 * disabledUserName helper. Pulls disabled contributor name off of user errors
 *
 * @class disabledUserName
 * @param {Object} contributor Disabled contributor
 * @return {String} Return disabled contributor name
 */
export function disabledUserName(params/* , hash */) {
    const [contrib] = params;
    return contrib.data.links.relationships.users.errors[0].meta.full_name;
}

export default helper(disabledUserName);
