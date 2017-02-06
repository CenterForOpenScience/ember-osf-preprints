import Ember from 'ember';
import permissions from 'ember-osf/const/permissions';

/**
 * @module ember-preprints
 * @submodule helpers
 */

/**
 * conditionsForContribRemoval helper - used to determine if removing a particular
 * contributor will still satisfy two conditions 1) @ least one registered admin 2) @ least one
 * bibliographic contributor
 *
 * @class conditionsForContribRemoval
 * @param {Object} contributorToRemove contributor you intend to remove
 * @param {Array} contributors list of all contributors on the preprint
 * @return {Boolean} Would removing contributor leave minimum number of registered
 * admins and bibliographic contributors?
 */

export function conditionsForContribRemoval(params/*, hash*/) {
    var [contributorToRemove, contributors] = params;
    var minRegisteredAdmins = false;
    var minBibliographic = false;
    contributors.forEach(function(contributor) {
        if (contributor.id !== contributorToRemove.id) {
            if (contributor.get('permission') === permissions.ADMIN && contributor.get('unregisteredContributor') === null) {
                minRegisteredAdmins = true;
            }
            if (contributor.get('bibliographic')) {
                minBibliographic = true;
            }
        }
    });
    return minRegisteredAdmins && minBibliographic;

}

export default Ember.Helper.helper(conditionsForContribRemoval);
