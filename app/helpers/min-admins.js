import Ember from 'ember';
/**
 * @module ember-preprints
 * @submodule helpers
 */

/**
 * minAdmins helper - used to determine if the user should be able to update permissions
 * of a particular contributor.  False if user is trying to update the permissions
 * of the sole admin.  All projects need at least one administrator.
 *
 * @class minAdmins
 * @param {Object} contrib contributor for which you intend to modify permissions
 * @param {Array} contributors list of all contributors on the preprint
 * @return {Boolean} Does updating this contributor leave minimum number of admins?
 */
export function minAdmins(params/*, hash*/) {
    let [contrib, contributors] = params;
    let registeredAdmins = 0;
    contributors.forEach(function(contributor) {
        if (contributor.get('permission') === 'admin' && contributor.get('unregisteredContributor') === null) {
            registeredAdmins++;
        }
    });
    if (registeredAdmins === 1 && contrib.get('permission') === 'admin' && contrib.get('unregisteredContributor') === null) {
        return false;
    } else {
        return true;
    }

}

export default Ember.Helper.helper(minAdmins);
