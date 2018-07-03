import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { not } from '@ember/object/computed';
import OSFAgnosticAuthControllerMixin from 'ember-osf/mixins/osf-agnostic-auth-controller';
/**
 * @module ember-preprints
 * @submodule controllers
 */

/**
 * @class Application Controller
 * @extends Ember-OSF.OSFAgnosticAuthControllerMixin
 */
export default Controller.extend(OSFAgnosticAuthControllerMixin, {
    i18n: service(),
    toast: service(),
    theme: service(),
    preprintWord: service(),
    session: service(),

    init() {
        this._super(...arguments);

        if (document.cookie.indexOf('osf_cookieconsent') > -1) {
            this.set('hasCookie', true);
        }
    },

    hasCookie: false,
    notAuthenticated: not('session.isAuthenticated'),

    actions: {
        addCookie() {
            // Make new cookie with expiration date 10 years in future
            const CookieDate = new Date();
            CookieDate.setFullYear(CookieDate.getFullYear() + 10);
            document.cookie = `osf_cookieconsent=1;expires=${CookieDate.toGMTString()};`;
            this.set('hasCookie', true);
        },
    },

});
