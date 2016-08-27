import Ember from 'ember';

import {
  validator, buildValidations
}
from 'ember-cp-validations';

/**
* Validations for adding unregistered contributor form.  fullName must be present
* and have three letters, and the username (email) must be present and of appropriate format.
*/
const Validations = buildValidations({
    fullName: {
        description: 'Full Name',
        validators: [
            validator('presence', true),
            validator('length', {
                min: 3
            })
        ]
    },
    username: {
        validators: [
            validator('presence', true),
            validator('format', {
                type: 'email',
                regex: /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i,
            })
       ]
    },
});

export default Ember.Component.extend(Validations, {
    fullName: null,
    username: null,
    isFormValid: Ember.computed.alias('validations.isValid'),
});
