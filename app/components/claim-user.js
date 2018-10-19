import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Analytics from 'ember-osf/mixins/analytics';
import { task } from 'ember-concurrency';
import { validator, buildValidations }
    from 'ember-cp-validations';

const Validations = buildValidations({
    email: {
        validators: [
            validator('presence', true),
            validator('format', {
                type: 'email',
                regex: /^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i,
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
    email: null,
    preprintId: null,
    author: null,
    isValid: alias('validations.isValid'),
    actions: {
        hidePopup() {
            this.set('showPopup', false);
        },
        togglePopup() {
            this.toggleProperty('showPopup');
        },
    },
    claimUser: task(function* () {
        const preprintId = this.get('preprintId');
        const email = this.get('email');
        const author = yield this.get('author.users');
        try {
            yield author.claimUnregisteredUser(preprintId, email);
            this.get('toast').success(this.get('i18n').t('components.claim-user.success_message', { email }));
        } catch (xhr) {
            const errorMsg = JSON.parse(xhr.responseText).errors[0].detail;
            this.get('toast').error(errorMsg);
        }
    }).drop(),
});
