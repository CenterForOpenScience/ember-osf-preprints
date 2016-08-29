import Ember from 'ember';

/**
 * userIsContributor - takes in a user and the list of all preprint contributors.
 * Returns true if the user is in the list of preprint contributors.
 *
 * @method userIsContributor
 * @param {Object} user User returned in search results.
 * @param {Array} contributors List of all contributors on the preprint.
 * @return {Boolean} Is the user a current contributor on the preprint?
 */
export function slice(params/*, hash*/) {
    var [array, start, finish] = params;
    return array.slice(start, finish);
}

export default Ember.Helper.helper(slice);
