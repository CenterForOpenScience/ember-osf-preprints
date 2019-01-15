import { helper } from '@ember/component/helper';

/**
 * @module ember-preprints
 * @submodule helpers
 */

/**
 * userErrors helper - whether embedded user has errors
 *
 * @class userErrors
 * @param {Object} contributor
 * @return {Boolean} Whether embedded user returned errors
 */
export function userErrors(params/* , hash */) {
    const [contrib] = params;
    const errors = contrib.get('data.links.relationships.users.errors');
    return errors && errors.length !== 0;
}

export default helper(userErrors);
