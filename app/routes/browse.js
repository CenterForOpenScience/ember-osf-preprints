import Ember from 'ember';

export default Ember.Route.extend({
    queryParams: {
        subject: {
            replace: true,
            refreshModel: true
        }
    },
    model() {
        // JamDB
//        return this.store.query('preprint', { "sort": "createdOn",  "page[size]": "10" } );
    },
    actions: {
        filter: function( subjectToFilter ) {
            this.transitionTo( { queryParams: { subject: subjectToFilter } } );
        }
    }
});
