import Ember from 'ember';

import OSFAgnosticAuthRouteMixin from 'ember-osf/mixins/osf-agnostic-auth-route';
import AnalyticsMixin from '../mixins/analytics-mixin';

export default Ember.Route.extend(AnalyticsMixin, OSFAgnosticAuthRouteMixin, {
    i18n: Ember.inject.service(),
    afterModel: function() {
        const availableLocales = this.get('i18n.locales').toArray();
        let locale;

        console.log(availableLocales);

        // Works in Chrome and Firefox (editable in settings)
        if (navigator.languages && navigator.languages.length) {
            for (let lang of navigator.languages) {
                if (availableLocales.contains(lang)) {
                    locale = lang;
                    break;
                }
            }
        }
        // Backup for Safari (uses system settings)
        else if (navigator.language && availableLocales.contains(navigator.language)) {
            locale = navigator.language;
        }

        if (locale)
            this.set('i18n.locale', navigator.language);
    }
});
