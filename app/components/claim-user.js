import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Analytics from 'ember-osf/mixins/analytics';
import { task } from 'ember-concurrency';
import config from 'ember-get-config';
import $ from 'jquery';
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
 * @module ember-preprints
 * @submodule components
 */

/**
 * Confirm share preprint modal
 *
 * Requires user to confirm they wish to submit their preprint,
 * thus making it public and searchable
 *
 * Sample usage:
 * ```handlebars
 * {{confirm-share-preprint
 *  isOpen=showModalSharePreprint
 *  shareButtonDisabled=shareButtonDisabled
 *  savePreprint=(action 'savePreprint')
 *  title=title
 *  buttonLabel=buttonLabel
 *}}
 * ```
 * @class confirm-share-preprint
 */
export default Component.extend(Validations, Analytics, {
    tagName: 'li',
    toast: service(),
    i18n: service(),
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
        const userId = this.get('author.userId');
        const url = `${config.OSF.apiUrl}/v2/users/${userId}/claim/`;
        const email = this.get('email');
        const id = this.get('preprintId');
        const payload = {
            data: {
                attributes: {
                    email,
                    id,
                },
            },
        };
        try {
            yield $.ajax({
                url,
                crossDomain: true,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(payload),
            });
            this.get('toast').success(this.get('i18n').t('components.claim-user.success_message', { email }));
        } catch (xhr) {
            const errorMsg = JSON.parse(xhr.responseText).errors[0].detail;
            this.get('toast').error(errorMsg);
        }
    }).drop(),
});
