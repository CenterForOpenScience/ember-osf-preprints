import Ember from 'ember';

export default Ember.Controller.extend({
    fullScreenMFR: false,
    expandedAuthors: true,
//    showingAuthors: Ember.computed('expandedAuthors', function() {
//        if (this.get('expandedAuthors')){
//            return this.get('authors');
//        }
//        return this.get('authors').slice(6);
//    }),
    actions: {
        expandMFR() {
            this.toggleProperty('fullScreenMFR');
        },
        expandAuthors() {
            this.toggleProperty('expandedAuthors');
        }
    },
});
