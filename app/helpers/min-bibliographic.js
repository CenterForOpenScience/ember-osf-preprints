import Ember from 'ember';
/**
 * @module ember-preprints
 * @submodule helpers
 */

/**
 * minBibliographic helper - used to determine if the user should be able to update bibliographic
 * info of a particular contributor.  False if user is trying to toggle the bibliographic
 * attribute of the sole bibliographic contributor.
 *
 * @class minBibliographic
 * @param {Object} contrib contributor that you intend to modify bibliographic information
 * @param {Array} contributors list of all contributors on the preprint
 * @return {Boolean} Does updating this contributor leave minimum number of bibliographic contributors?
 */
export function minBibliographic(params/*, hash*/) {
    var [contrib, contributors] = params;
    var numBib = 0;
    contributors.forEach(function(contributor) {
        if (contributor.get('bibliographic')) {
            numBib++;
        }
    });
    if (numBib === 1 && contrib.get('bibliographic')) {
        return false;
    } else {
        return true;
    }
}

export default Ember.Helper.helper(minBibliographic);
