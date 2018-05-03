import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import Analytics from 'ember-osf/mixins/analytics';
import OSFAgnosticAuthRouteMixin from 'ember-osf/mixins/osf-agnostic-auth-route';

/**
 * @module ember-preprints
 * @submodule routes
 */

/**
 * @class Application Route Handler
 */
export default Route.extend(Analytics, OSFAgnosticAuthRouteMixin, {
    i18n: service(),
    store: service(),
    theme: service(),
    headTags: function() {
        return this.get('theme.headTags');
    },
    beforeModel: function () {
        let detectBrandedDomain = () => {
            // Set the provider ID from the current origin
            if (window.isProviderDomain) {
                return this.get('store').query(
                    'preprint-provider',
                    {
                        filter: {
                            domain: `${window.location.origin}/`,
                        }
                    }
                ).then(providers => {
                    if (providers.length) {
                        this.set('theme.id', providers.objectAt(0).get('id'));
                    }
                });
            }
        };
        let parentResult = this._super(...arguments);
        // Chain on to parent's promise if parent returns a promise.
        return parentResult instanceof Promise ? parentResult.then(detectBrandedDomain) : detectBrandedDomain();
    },

    afterModel: function() {
        const availableLocales = this.get('i18n.locales').toArray();
        let locale;

        // Works in Chrome and Firefox (editable in settings)
        if (navigator.languages && navigator.languages.length) {
            for (let lang of navigator.languages) {
                if (availableLocales.includes(lang)) {
                    locale = lang;
                    break;
                }
            }
        }
        // Backup for Safari (uses system settings)
        else if (navigator.language && availableLocales.includes(navigator.language)) {
            locale = navigator.language;
        }

        if (locale)
            this.set('i18n.locale', locale);
    },

    actions: {
        didTransition: function() {
          window.prerenderReady = true;
          return true; // Bubble the didTransition event
        }
    },
});
