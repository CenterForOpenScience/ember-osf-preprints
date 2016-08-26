import Ember from 'ember';

export default Ember.Controller.extend({
    keenCounts: null,
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
