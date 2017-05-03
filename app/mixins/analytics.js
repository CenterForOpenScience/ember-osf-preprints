import Ember from 'ember';

/**
 * @module ember-preprints
 * @submodule mixins
 */

/**
 * Google Analytics mixin. Provides actions that can be used in templates to track events.
 *
 * @class AnalyticsMixin
 */
export default Ember.Mixin.create({
    metrics: Ember.inject.service(),
    actions: {
        click(category, label, url) {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category,
                    action: 'click',
                    label
                });

            // Needed for outbound links, see https://support.google.com/analytics/answer/1136920?hl=en
            // Also prevents mouse events from being attached to the window location
            if (url && typeof url !== 'object')
                window.location.href = url;

            return true;
        },
        track(category, action, label) {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category,
                    action,
                    label
                });
            return true;

        }
    }
});
