import Ember from 'ember';
import $ from 'jquery';

export default Ember.Route.extend({
    queryParams: {
        subject: {
            replace: true,
            refreshModel: true
        }
    },

    model() {
        return Ember.RSVP.hash({
            preprints: this.store.findAll('preprint'),
            subjects: this.store.findAll('subject'),
            taxonomy: this.store.findAll('taxonomy')
        });
    },
    actions: {
        filter: function(subjectToFilter) {
            this.transitionTo( {queryParams: { subject: subjectToFilter } } );
        }
    }
});


