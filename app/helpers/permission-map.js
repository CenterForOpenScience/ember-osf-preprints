import Ember from 'ember';
import permissions, { permissionSelector } from 'ember-osf/const/permissions';

/**
* permissionMap helper.  Maps short form of the contributor's permissions
* passed in params to the long form.
*
*/
export function permissionMap(params/*, hash*/) {
    var map = {};
    for (var i = 0; i < permissionSelector.length; i++) {
        map[permissionSelector[i].value] = permissionSelector[i].text;
    }
    var permission = params[0];
    return map[permission];
}

export default Ember.Helper.helper(permissionMap);
