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
                type: 'email'
            })
       ]
    },
});

export default Ember.Component.extend(Validations, {
    fullName: null,
    username: null,
    isFormValid: Ember.computed.alias('validations.isValid'),
    actions: {
        emptyView() {
            this.sendAction('emptyView');
        },
        addUnregisteredContributor(fullName, email) {
            this.sendAction('addUnregisteredContributor', fullName, email);

        }
    }
});
