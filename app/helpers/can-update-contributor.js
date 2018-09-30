import { helper } from '@ember/component/helper';

/**
* @module ember-preprints
* @submodule helpers
*/

/**
* canUpdateContributor helper.  Checks to see if user has proper permissions
* to update the contributor.  The user must be an admin, and in Submit mode, cannot remove herself.
*
* @class canUpdateContributor
* @param {Object} contributor Contributor you wish to update.
* @param {Object} currentUser Current logged in user.
* @param {Boolean} isAdmin Whether current user is a preprint admin
* @param {Boolean} editMode Is the preprint in editMode?
* @return {Boolean} Does current user have permission to update the contributor?
*/
export function canUpdateContributor(params/* , hash */) {
    const [contributor, currentUser, isAdmin, editMode] = params;
    const currentUserId = currentUser.get('currentUserId') || currentUser.get('id');
    const updateSelf = contributor.get('userId') === currentUserId;

    if (editMode) {
        return isAdmin;
    } else {
        // On preprint's submit page, not allowing preprint creator to modify their permissions
        return (!updateSelf && isAdmin);
    }
}

export default helper(canUpdateContributor);
