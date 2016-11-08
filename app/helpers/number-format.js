import Ember from 'ember';

export function numberFormat(params/*, hash*/) {
    const [number] = params;

    return number.toLocaleString();
}

export default Ember.Helper.helper(numberFormat);
