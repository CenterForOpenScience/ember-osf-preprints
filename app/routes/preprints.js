import Ember from 'ember';
import config from 'ember-get-config';

export default Ember.Route.extend({
    model(params) {
        return Ember.RSVP.hash({
            id: params.file_id,
            baseUrl: config.OSF.url,
            renderUrl: config.OSF.renderUrl,
            preprint: this.store.findRecord('preprint', params.file_id),
            supplement: [],
            primary: [],
        });
    }
});

