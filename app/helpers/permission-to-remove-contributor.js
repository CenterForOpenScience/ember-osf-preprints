import Ember from 'ember';

/**
* permissionToRemoveContributor helper.  Checks to see if user has proper permissions
* to remove contributor.  The user either must be an admin or trying to remove herself.
* The project cannot be a registration.
*
* @method permissionToRemoveContributor
* @param {Object} contributor Contributor you wish to remove.
* @param {Object} currentUser Current logged in user.
* @param {Boolean} stillAdmin Whether current user is still a preprint admin
* @param {Object} node The preprint itself.
* @return {Boolean} Does current user have permission to remove this particular contributor?
*/
export function permissionToRemoveContributor(params/*, hash*/) {
    var [contributor, currentUser, stillAdmin, node] = params;
    var currentUserId = currentUser.get('currentUserId') || currentUser.get('id');
    var removeSelf = contributor.get('userId') === currentUserId;
    var isRegistration = node.get('registration');
    return ((removeSelf || stillAdmin) && !isRegistration);

}

export default Ember.Helper.helper(permissionToRemoveContributor);
