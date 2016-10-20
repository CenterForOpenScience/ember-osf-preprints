import Ember from 'ember';

var filters = {
    'Open Science Framework': 'OSF',
    'Cognitive Sciences ePrint Archive': 'Cogprints',
    OSF: 'OSF Preprints',
    'Research Papers in Economics': 'RePEc'
};

export function filterReplace(params) {
    return filters[params[0]] ? filters[params[0]] : params[0];
}

export default Ember.Helper.helper(filterReplace);
