import Ember from 'ember';

export function ifFilter(params) {
    if ((typeof params[1] === 'undefined') || ((params[0].toLowerCase()).indexOf(params[1].toLowerCase()) !== -1)) {
        return true;
    }
    return false;
}

export default Ember.Helper.helper(ifFilter);
