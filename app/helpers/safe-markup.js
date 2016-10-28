import Ember from 'ember';

export function safeMarkup(params/*, hash*/) {
    return Ember.String.htmlSafe(params.join(''));
}

export default Ember.Helper.helper(safeMarkup);
