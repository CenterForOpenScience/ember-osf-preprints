import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Analytics from 'ember-osf/mixins/analytics';
import { task } from 'ember-concurrency';
import { validator, buildValidations }
    from 'ember-cp-validations';
import emailValidationRegex from '../utils/email-validation';

const Validations = buildValidations({
    email: {
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
 * @module ember-osf-preprints
 * @submodule components
 */

/**
 * Allow not-logged-in users to claim an unregistered user
 *
 * Sample usage:
 * ```handlebars
 * {{claim-user
 *      author=author
 *      preprintId=preprintId
 * }}
 * ```
 * @class claim-user
 */
export default Component.extend(Validations, Analytics, {
    toast: service(),
    i18n: service(),
    tagName: 'li',
    showPopup: false,
    showModal: false,
    email: null,
    preprintId: null,
    author: null,
    username: null,
    currentUser: null,
    isValid: alias('validations.isValid'),
    didReceiveAttrs() {
        this._super(...arguments);
        if (this.get('isLoggedIn')) {
            this.get('getUserEmail').perform();
        }
    },
    actions: {
        hidePopup() {
            this.set('showPopup', false);
        },
        togglePopup() {
            this.toggleProperty('showPopup');
        },
        toggleModal() {
            this.toggleProperty('showModal');
        },
    },
    getUserEmail: task(function* () {
        const primary = true;
        const primaryEmail = yield this.get('currentUser').queryHasMany('emails', { filter: { primary } });
        this.set('username', primaryEmail[0].get('emailAddress'));
    }),
    claimUser: task(function* () {
        const preprintId = this.get('preprintId');
        const email = this.get('email');
        const author = yield this.get('author.users');
        this.set('showModal', false);
        try {
            yield author.claimUnregisteredUser(preprintId, email);
            this.get('toast').success(this.get('i18n').t('components.claim-user.success_message', { email }));
        } catch (xhr) {
            const errorMsg = JSON.parse(xhr.responseText).errors[0].detail;
            this.get('toast').error(errorMsg);
        }
    }).drop(),
});
