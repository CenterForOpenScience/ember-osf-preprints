import Ember from 'ember';

export function contributorName([givenName, familyName, fullName]) {
    if (givenName && familyName){
        return [givenName, familyName].join(' ');
    } else {
        return fullName;
    }
}

export default Ember.Helper.helper(contributorName);
