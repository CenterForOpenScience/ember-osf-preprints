import Ember from 'ember';

/**
 * minBibliographic helper - used to determine if the user should be able to update bibliographic
 * info of a particular contributor.  False if user is trying to toggle the bibliographic
 * attribute of the sole bibliographic contributor.
 *
 */
export function minBibliographic(params/*, hash*/) {
    var contrib = params[0];
    var contributors = params[1];
    if (contributors) {
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
    } else {
        return params;
    }
}

export default Ember.Helper.helper(minBibliographic);
