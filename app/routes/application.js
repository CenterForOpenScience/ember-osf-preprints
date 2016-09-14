import Ember from 'ember';

import OSFAgnosticAuthRouteMixin from 'ember-osf/mixins/osf-agnostic-auth-route';
import AnalyticsMixin from '../mixins/analytics-mixin';

export default Ember.Route.extend(AnalyticsMixin, OSFAgnosticAuthRouteMixin, {
    i18n: Ember.inject.service(),
    afterModel: function() {
        let locale;

        // Works in Chrome and Firefox (editable in settings)
        if (navigator.languages && navigator.languages[0])
            locale = navigator.languages[0];
        // Backup for Safari (uses system settings)
        else if (navigator.language)
            locale = navigator.language;

        if (locale)
            this.set('i18n.locale', locale);
    }
});
