import Ember from 'ember';

export default Ember.Route.extend({
    fileManager: Ember.inject.service(),
    model() {
        return Ember.RSVP.hash({
            theDate: new Date(),
            preprints: this.store.findAll('preprint'),
            subjects: this.store.query('taxonomy', { filter: { parent_ids: 'null' }, page: { size : 20 } })
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
