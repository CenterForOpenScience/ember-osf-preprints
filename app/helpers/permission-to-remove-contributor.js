import Ember from 'ember';

/**
* permissionToRemoveContributor helper.  Checks to see if user has proper permissions
* to remove contributor.  The user either must be an admin or trying to remove herself.
* The project cannot be a registration.
*/
export function permissionToRemoveContributor(params/*, hash*/) {
    var [contributor, currentUser, stillAdmin, node] = params;
    if (currentUser) {
        var currentUserId = currentUser.get('currentUserId') || currentUser.get('id');
        var removeSelf = contributor.get('userId') === currentUserId;
        var isRegistration = node.get('registration');
        return ((removeSelf || stillAdmin) && !isRegistration);
    } else {
        return params;
    }
}

export default Ember.Helper.helper(permissionToRemoveContributor);
