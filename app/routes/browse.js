import Ember from 'ember';

export default Ember.Route.extend({
    queryParams: {
        subjects: {
            replace: true
        },
        query: {
            replace: true
        }
    },
    model() {
        return Ember.RSVP.hash({
            preprints: this.store.findAll('preprint'),
            taxonomy: this.store.findAll('taxonomy')
        });
    },
    actions: {
        filter(subjectsToFilter) {
            this.transitionTo({ queryParams: { subjects: subjectsToFilter } });
        },
        search(q) {
            this.transitionTo({ queryParams: { query: q } });
        }
    }
});
