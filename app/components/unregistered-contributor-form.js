import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import Analytics from 'ember-osf/mixins/analytics';

import { validator, buildValidations }
    from 'ember-cp-validations';
import emailValidationRegex from '../utils/email-validation';

/* Validations for adding unregistered contributor form.  fullName must be present
and have three letters, and the username (email) must be present and of appropriate format.
*/
const Validations = buildValidations({
    fullName: {
        description: 'Full Name',
        validators: [
            validator('presence', true),
            validator('length', {
                min: 3,
            }),
        ],
    },
    username: {
        validators: [
            validator('presence', true),
            validator('format', {
                type: 'email',
                regex: emailValidationRegex,
            }),
        ],
    },
});
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Allows user to add author to their preprint by name and email
 *
 * Sample usage:
 * ```handlebars
 * {{unregistered-contributor-form
 *      editMode=editMode
 *      resetfindContributorsView=(action 'resetfindContributorsView')
 *      addUnregisteredContributor=(action 'addUnregisteredContributor')
 * }}
 * ```
 * @class unregistered-contributor-form
 */
export default Component.extend(Validations, Analytics, {
    fullName: null,
    username: null,
    isFormValid: alias('validations.isValid'),
    actions: {
        addUnregistered(fullName, email) {
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Add Author By Email`,
                });
            if (this.get('isFormValid')) {
                this.attrs.addUnregisteredContributor(fullName, email);
            }
        },
    },

});
