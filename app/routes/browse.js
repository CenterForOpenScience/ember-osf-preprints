import Ember from 'ember';

export default Ember.Route.extend({
    queryParams: {
        subject: {
            replace: true,
            refreshModel: true
        }
    },
    model() {
        return this.store.findAll('preprint');
    },
    actions: {
        filter: function(subjectToFilter) {
            this.transitionTo( { queryParams: { subject: subjectToFilter } } );
        }
    }
});
