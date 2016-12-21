import Ember from 'ember';

/**
 * sliceArray - returns shallow copy of portion of array
 *
 * @method sliceArray
 * @param {Array} array
 * @param {Integer} startIndex
 * @param {Integer} stopIndex
 * @return {Array} sliced array
 */
export function sliceArray(params/*, hash*/) {
    var [array, start, finish] = params;
    return array.slice(start, finish);
}

export default Ember.Helper.helper(sliceArray);
