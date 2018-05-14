// Ember-I18n includes configuration for common locales. Most users
// can safely delete this file. Use it if you need to override behavior
// for a locale or define behavior for a locale that Ember-I18n
// doesn't know about.
export default {
    rtl: false,

    pluralForm(count) {
        if (count === 0) { return 'cero'; }
        if (count === 1) { return 'uno/a'; }
        if (count === 2) { return 'dos'; }
        if (count < 5) { return 'algunos/as'; }
        if (count >= 5) { return 'muchos/as'; }
        return 'otros/as';
    },
};
