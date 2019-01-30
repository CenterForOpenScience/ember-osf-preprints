import { helper } from '@ember/component/helper';

/**
 * @module ember-preprints
 * @submodule helpers
 */

/**
 * permissionToRemoveContributor helper.  Checks to see if user has proper permissions
 * to remove contributor.  The user must be an admin and cannot remove herself.
 *
 * @class permissionToRemoveContributor
 * @param {Object} contributor Contributor you wish to remove.
 * @param {Object} currentUser Current logged in user.
 * @param {Boolean} isAdmin Whether current user is a preprint admin
 * @param {Boolean} editMode Is the preprint in editMode?
 * @return {Boolean} Does current user have permission to remove this particular contributor?
 */
export function permissionToRemoveContributor(params/* , hash */) {
    const [contributor, currentUser, isAdmin, editMode] = params;
    const currentUserId = currentUser.get('currentUserId') || currentUser.get('id');
    const removeSelf = contributor.get('userId') === currentUserId;

    if (editMode) {
        return (removeSelf || isAdmin);
    } else {
        // On preprint's submit page, not allowing preprint creator to remove themselves as an admin
        return (!removeSelf && isAdmin);
    }
}

export default helper(permissionToRemoveContributor);
