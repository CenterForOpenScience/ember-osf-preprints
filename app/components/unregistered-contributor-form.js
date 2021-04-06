import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import Analytics from 'ember-osf/mixins/analytics';

import { validator, buildValidations }
    from 'ember-cp-validations';

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
                regex: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, // for more context https://emailregex.com/
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
