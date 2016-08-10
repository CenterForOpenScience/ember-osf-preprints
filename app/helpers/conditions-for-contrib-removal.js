import Ember from 'ember';

/**
 * conditionsForContribRemoval helper - used to determine if the removing a particular
 * contributor will still satisfy two conditions 1) @ least one registered admin 2) @ least one
 * bibliographic contributor
 *
 */
export function conditionsForContribRemoval(params/*, hash*/) {
    var contributorToRemove = params[0];
    var contributors = params[1];
    if (contributors) {
        var minRegisteredAdmins = false;
        var minBibliographic = false;
        contributors.forEach(function(contributor) {
            if (contributor.id !== contributorToRemove.id) {
                if (contributor.get('permission') === 'admin' && contributor.get('unregisteredContributor') === null) {
                    minRegisteredAdmins = true;
                }
                if (contributor.get('bibliographic')) {
                    minBibliographic = true;
                }
            }
        });
        return minRegisteredAdmins && minBibliographic;
    } else {
        return params;
    }
}

export default Ember.Helper.helper(conditionsForContribRemoval);
