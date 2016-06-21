import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {});

export default Ember.Route.extend({
    fileManager: Ember.inject.service(),
    model() {
    //MIRAGE
        return {
            preprints: this.store.findAll('preprint'),
            subjects: this.store.findAll('subject')
        };

    //EMBER OSF
    //return this.store.findAll('Node');
    },
    actions: {
        goToSubject(sub, subID) {
            this.transitionTo('browse-preprints', {queryParams: {subject: sub, subjectID: subID}});
        }
    }
});
