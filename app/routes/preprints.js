import Ember from 'ember';

export default Ember.Route.extend({
    model(params) {
            return Ember.RSVP.hash({
            id: params.file_id,
            // JamDB
            preprint: this.store.findRecord('preprint', params.file_id)
        });
    }
});

