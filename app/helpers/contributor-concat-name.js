import Ember from 'ember';

export function contributorConcatName([givenName, familyName, fullName]) {
    if (givenName && familyName){
        return [givenName, familyName].join(' ');
    } else {
        return fullName;
    }
}

export default Ember.Helper.helper(contributorConcatName);
