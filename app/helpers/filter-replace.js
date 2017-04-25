import Ember from 'ember';

var filters = {
    'Open Science Framework': 'OSF',
    'Cognitive Sciences ePrint Archive': 'Cogprints',
    OSF: 'OSF Preprints',
    'Research Papers in Economics': 'RePEc'
};

/**
 * @module ember-preprints
 * @submodule helpers
 */

/**
 * filterReplace helper. Replaces long provider names without messing with search filter logic
 *
 * @class filterReplace
 * @param {String} filter Filter
 * @return {String} Return shortened provider filter, if present in filters.
 * Otherwise, return original filter.
 */
export function filterReplace(params) {
    return filters[params[0]] ? filters[params[0]] : params[0];
}

export default Ember.Helper.helper(filterReplace);
