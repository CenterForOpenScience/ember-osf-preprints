import { helper } from '@ember/component/helper';

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
export function contributorIsCurrentUser(params/* , hash */) {
    const [contributor, currentUser] = params;
    const currentUserId = currentUser.get('currentUserId') || currentUser.get('id');
    return contributor.get('userId') === currentUserId;
}

export default helper(contributorIsCurrentUser);
