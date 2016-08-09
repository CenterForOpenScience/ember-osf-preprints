import Ember from 'ember';

export default Ember.Route.extend({
    fileManager: Ember.inject.service(),
    model() {
        return Ember.RSVP.hash({
            theDate: new Date(),

            preprints: this.store.findAll('preprint'),
            subjects: this.store.find('taxonomy', 'plos')
        });
    },
    actions: {
        goToSubject(sub) {
            this.transitionTo('browse', { queryParams: { subject: sub } });
        },
        togglePopularUploads() {
            let newHeight = (Ember.$('#landing-page-preprint-list').height() === 700) ? 2500 : 700;
            Ember.$('#landing-page-preprint-list').css('max-height', newHeight);
            Ember.$('#show-more-icon').toggleClass('fa fa-caret-down fa fa-caret-up');
        },
        search(q) {
            this.transitionTo('browse', { queryParams: { query: q } });
        }
    }
});
