import Ember from 'ember';
import config from 'ember-get-config';

//TODO: Remove RSVP hash - use setupController to get supplement
export default Ember.Route.extend({
    model(params) {
        return Ember.RSVP.hash({
            id: params.file_id,
            baseUrl: config.OSF.url,
            renderUrl: config.OSF.renderUrl,
            preprint: this.store.findRecord('preprint', params.file_id),
            supplement: this.getSupplement(),
            primary: this.store.findRecord('file', 'mj39h'), //Primary file should come from preprint in the future
        });
    },
    getSupplement() {
        return this.store.findRecord(
            'node', '3jbv9'
            ).then(
                node => node.query(
                'files', { 'filter[name]': 'osfstorage' }
                ).then(
                    providers => {
                        var provider = providers.get('firstObject');
                        if (provider) {
                            return provider.get('files');
                        }
                    }
                )
            );
    },
});

