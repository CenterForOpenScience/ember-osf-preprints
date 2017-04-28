import Ember from 'ember';
/**
 * @module ember-preprints
 * @submodule helpers
 */

/**
 * extractText - returns a comma separated text of subject children for a given preprint provider.
 *
 * @class sliceArray
 * @param {Array} subjectChildren
 * @param {Integer} number of children to extract
 * @return {String}
 */
export function extractText(params/*, hash*/) {
    const sortedSubjects = params[0].sortBy('text').slice(0, params[1]);
    let subjectTooltip = sortedSubjects.objectAt(0).text;
    for (let i = 1; i< sortedSubjects.get('length'); i++){
        subjectTooltip = subjectTooltip + ', '+ sortedSubjects.objectAt(i).text;
    }
    return subjectTooltip;
}

export default Ember.Helper.helper(extractText);