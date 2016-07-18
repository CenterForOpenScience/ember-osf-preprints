import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend({
    fileManager: Ember.inject.service(),
    model() {
        return Ember.RSVP.hash({
            theDate: new Date(),

            // JamDB
            preprints: this.store.findAll('preprint'),
            subjects: this.store.find('taxonomy', 'topLevel')
        });
    },
    actions: {
        goToSubject(sub) {
            this.transitionTo('browse', { queryParams: { subject: sub } });
        },
        togglePopularUploads() {
            let newHeight = (this.$('#landing-page-preprint-list').height() === 700) ? 2500 : 700;
            this.$('#landing-page-preprint-list').css('max-height', newHeight);
            this.$('#show-more-icon').toggleClass('fa fa-caret-down fa fa-caret-up');
        },
        search: function(q) {
            this.transitionTo('browse', { queryParams: { query: q } });
        }
    }
});
