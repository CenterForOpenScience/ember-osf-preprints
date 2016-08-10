import Ember from 'ember';

/**
* permissionMap helper.  Maps short form of the contributor's permissions
* passed in params to the long form.
*
*/
export function permissionMap(params/*, hash*/) {
    var map = {
        read: 'Read',
        write: 'Read + Write',
        admin: 'Administrator'
    };
    var permission = params[0];
    return map[permission];
}

export default Ember.Helper.helper(permissionMap);
