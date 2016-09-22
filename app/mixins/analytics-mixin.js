import Ember from 'ember';

const actionTypes = [
    'click',
    'blur'
];

const actions = {};

for (let action of actionTypes) {
    actions[action] = function(category, label) {
        Ember.get(this, 'metrics')
            .trackEvent({
                category,
                action,
                label
            });

        return true;
    };
}


export default Ember.Mixin.create({
    metrics: Ember.inject.service(),
    actions
});
