import Ember from 'ember';

export default Ember.Route.extend({
    queryParams: {
        subject: {
            replace: true,
            refreshModel: true
        }
    },

    model() {
        return Ember.RSVP.hash({
//            preprints: this.store.findAll('preprint'),
//            taxonomy: this.store.find('taxonomy', 'taxonomy')
        });
    },
    actions: {
        filter: function(subjectToFilter) {
            this.transitionTo( { queryParams: { subject: subjectToFilter } } );
        }
    }
});


