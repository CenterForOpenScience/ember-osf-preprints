import Ember from 'ember';
import config from 'ember-get-config';

export default Ember.Route.extend({
    model(params) {
        return this.store.findRecord('preprint', params.file_id);
    },
});

