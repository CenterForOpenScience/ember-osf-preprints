import Ember from 'ember';

export default Ember.Route.extend({
    queryParams: {
        subject: {
            replace: true
        },
        query: {
            replace: true
        }
    },
    model() {
        // JamDB
        return Ember.RSVP.hash({
            preprints: this.store.query('preprint', { "sort": "createdOn",  "page[size]": "10" } ),
            taxonomy: this.store.find('taxonomy', 'topLevel')
        });
    },
    actions: {
        filter: function( subjectToFilter ) {
            this.transitionTo( { queryParams: { subject: subjectToFilter } } );
        },
        search: function( q ) {
            this.transitionTo( { queryParams: { query: q } } );
        }
    }
});
