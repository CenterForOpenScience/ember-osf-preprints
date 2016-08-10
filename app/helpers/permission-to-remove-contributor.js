import Ember from 'ember';

/**
* permissionToRemoveContributor helper.  Checks to see if user has proper permissions
* to remove contributor.  The user either must be an admin or trying to remove herself.
* The project cannot be a registration.
*/
export function permissionToRemoveContributor(params/*, hash*/) {
    var contributor = params[0];
    var currentUser = params[1];
    var stillAdmin = params[2];
    var node = params[3];
    if (currentUser) {
        var currentUserId = currentUser.get('currentUserId') || currentUser.get('id');
        var removeSelf = contributor.id.split('-')[1] === currentUserId;
        var isRegistration = node.get('registration');
        return ((removeSelf || stillAdmin) && !isRegistration);
    } else {
        return params;
    }
}

export default Ember.Helper.helper(permissionToRemoveContributor);
