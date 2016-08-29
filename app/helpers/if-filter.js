import Ember from 'ember';

/**
 * To be used within an {#if} block, to only displays an item if it matches a filter.
 *
 * @class ifFilter
 * @param params: 0 indicates the element, 1 indicates the filter, 2 for list intersection
 */
export function ifFilter(params) {
    if (params[2]) {
        let match = params[0].filter(each => params[1].indexOf(each) !== -1);
        return match.length;
    }
    if ((typeof params[1] === 'object')) {
        return params[1].indexOf(params[0]) !== -1;
    }
    if ((typeof params[1] === 'undefined') || ((params[0].toLowerCase()).indexOf(params[1].toLowerCase()) !== -1)) {
        return true;
    }
    return false;
}

export default Ember.Helper.helper(ifFilter);
