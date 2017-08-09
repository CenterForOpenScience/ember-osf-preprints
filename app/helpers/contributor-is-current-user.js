import Ember from 'ember';

/**
 * @module ember-preprints
 * @submodule helpers
 */

/**
 * contributorIsCurrentUser helper. Checks to see if particular contributor listed is the current
 * logged in user
 *
 * @class contributorIsCurrentUser
 * @param {Object} contributor Contributor in question.
 * @param {Object} currentUser Current logged in user.
 * @return {Boolean} Is this contributor the current user?
 */
export function contributorIsCurrentUser(params/*, hash*/) {
    var [contributor, currentUser] = params;
    var currentUserId = currentUser.get('currentUserId') || currentUser.get('id');
    return contributor.get('userId') === currentUserId;
}

export default Ember.Helper.helper(contributorIsCurrentUser);
