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
//        return this.store.query('preprint', { "sort": "createdOn",  "page[size]": "10" } );
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
