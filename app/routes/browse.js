import Ember from 'ember';

export default Ember.Route.extend({
    queryParams: {
        subjects: {
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
            taxonomy: this.store.find('taxonomy', 'top3levels')
        });
    },
    actions: {
        filter: function( subjectsToFilter ) {
            this.transitionTo( { queryParams: { subjects: subjectsToFilter } } );
        },
        search: function( q ) {
            this.transitionTo( { queryParams: { query: q } } );
        }
    }
});
