import Ember from 'ember';

/**
  * safeMarkup helper. Returns a string that will not be HTML escaped by Handlebars.
  *
  * @method safeMarkup
  * @param {string} string
  * @return {Object} Returns Handlebars.SafeString
  */export function safeMarkup(params/*, hash*/) {
    return Ember.String.htmlSafe(params.join(''));
}

export default Ember.Helper.helper(safeMarkup);
