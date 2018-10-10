import { helper } from '@ember/component/helper';

/**
 * @module ember-preprints
 * @submodule helpers
 */

/**
* profileImageLink helper. Gets profile image link off of user object or errors
*
* @class profileImageLink
* @param {Object} contributor Contributor object
* @return {String} Return profile image link
*/
export function profileImageLink(params/* , hash */) {
    const [contrib] = params;
    const errors = contrib.get('data.links.relationships.users.errors');
    if (errors) {
        return errors[0].meta.profile_image;
    } else {
        return contrib.get('users.profileImage');
    }
}

export default helper(profileImageLink);
