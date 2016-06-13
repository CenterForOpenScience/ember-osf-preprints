import Ember from 'ember';
import OsfLoginRouteMixin from 'ember-osf/mixins/osf-login-route';

export default Ember.Route.extend({OsfLoginRouteMixin
});

export default Ember.Route.extend({
    model() {
        return {
            preprints: this.store.findAll('preprint'),
            subjects: this.store.findAll('subject')
        };
    },
    actions: {
        goToSubject(sub, subID) {
            this.transitionTo('browse-preprints', {queryParams: {subject: sub, subjectID: subID}});
        }
    }
});
