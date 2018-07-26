import { helper } from '@ember/component/helper';

/**
 * @module ember-preprints
 * @submodule helpers
 */

/**
 * userIsContributor - takes in a user and the list of all preprint contributors.
 * Returns true if the user is in the list of preprint contributors.
 *
 * @class userIsContributor
 * @param {Object} user User returned in search results.
 * @param {Array} contributors List of all contributors on the preprint.
 * @return {Boolean} Is the user a current contributor on the preprint?
 */
export function userIsContributor(params/* , hash */) {
    const [user, contributors] = params;
    const userIds = contributors.map(contrib => contrib.get('userId'));
    return userIds.indexOf(user.id) > -1;
}

export default helper(userIsContributor);
