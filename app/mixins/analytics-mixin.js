import Ember from 'ember';

const actionTypes = [
    'click',
    'blur'
];

const actions = {};

for (let action of actionTypes) {
    actions[action] = function(category, label, url) {
        Ember.get(this, 'metrics')
            .trackEvent({
                category,
                action,
                label
            });

        // Needed for outbound links, see https://support.google.com/analytics/answer/1136920?hl=en
        if (url)
            window.location.href = url;

        return false;
    };
}


export default Ember.Mixin.create({
    metrics: Ember.inject.service(),
    actions
});
