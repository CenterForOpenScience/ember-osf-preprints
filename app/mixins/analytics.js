import Ember from 'ember';

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
            if (url)
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
