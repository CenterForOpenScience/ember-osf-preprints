import Ember from 'ember';

export default Ember.Controller.extend({
    fullScreenMFR: false,
    actions: {
        expandMFR() {
            this.toggleProperty('fullScreenMFR');
        },
    },
});
