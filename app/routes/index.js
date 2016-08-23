import Ember from 'ember';
import config from 'ember-get-config';

export default Ember.Route.extend({
    fileManager: Ember.inject.service(),
    model() {
        return Ember.RSVP.hash({
            theDate: new Date(),
            subjects: this.store.query('taxonomy', { filter: { parents: 'null' }, page: { size: 20 } }),
            preprints: this.store.findRecord('preprint-provider', config.PREPRINTS.provider).then(provider => provider.get('preprints')),
        });
    },
    actions: {
        // TODO: properly transfer subject to discover route
        goToSubject(sub) {
            this.transitionTo('discover', { queryParams: { subject: sub } });
        },
        search(q) {
            this.transitionTo('discover', { queryParams: { searchString: q } });
        }
    }
});
