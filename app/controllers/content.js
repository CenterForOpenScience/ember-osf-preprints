import Ember from 'ember';

export default Ember.Controller.extend({
    fullScreenMFR: false,
    expandedAuthors: true,
    actions: {
        expandMFR() {
            this.toggleProperty('fullScreenMFR');
        },
        expandAuthors() {
            this.toggleProperty('expandedAuthors');
        }
    },
});
