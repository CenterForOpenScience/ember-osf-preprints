import Ember from 'ember';

export default Ember.Route.extend({
    model(params) {
        return this.store.findRecord('preprint', params.preprint_id);
    },
    actions: {
        error: function() {
            this.transitionTo('/page-not-found');
        }
    }
});
