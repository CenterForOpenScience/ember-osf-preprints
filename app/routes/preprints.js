import Ember from 'ember';
import config from 'ember-get-config';
import $ from 'jquery';

export default Ember.Route.extend({
    model(params) {
            return Ember.RSVP.hash({
            id: params.file_id,
            baseUrl: config.OSF.url,
            renderUrl: config.OSF.renderUrl,
            // JamDB
            preprint: this.store.findRecord('preprint', params.file_id),
            project: this.store.findRecord('file', '57755becda3e2401f3efd988').then(file => file.get('links').download.split('/')[5]),
            downloadLink: this.store.findRecord('file', '57755becda3e2401f3efd988').then(file => file.get('links').download)
        });
    }
});

