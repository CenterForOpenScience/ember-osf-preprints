import { helper } from '@ember/component/helper';

/**
 * @module ember-preprints
 * @submodule helpers
 */

/**
 * permissionToRemoveContributor helper.  Checks to see if user has proper permissions
 * to remove contributor.  The user must be an admin and cannot remove herself.
 * The project cannot be a registration.
 *
 * @class permissionToRemoveContributor
 * @param {Object} contributor Contributor you wish to remove.
 * @param {Object} currentUser Current logged in user.
 * @param {Boolean} isAdmin Whether current user is a preprint admin
 * @param {Object} node The preprint itself.
 * @return {Boolean} Does current user have permission to remove this particular contributor?
 */
export function permissionToRemoveContributor(params/* , hash */) {
    const [contributor, currentUser, isAdmin, node] = params;
    const currentUserId = currentUser.get('currentUserId') || currentUser.get('id');
    const removeSelf = contributor.get('userId') === currentUserId;
    let isRegistration = null;
    if (node) {
        isRegistration = node.get('registration');
    }
    return (!removeSelf && isAdmin && !isRegistration);
}

export default helper(permissionToRemoveContributor);
