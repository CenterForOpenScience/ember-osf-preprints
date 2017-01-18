import Ember from 'ember';

export function fixSpecialChar(params/*, hash*/) {
  return params.join('').replace(/&amp;/g, '&');
}

export default Ember.Helper.helper(fixSpecialChar);
