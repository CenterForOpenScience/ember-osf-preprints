import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import $ from 'jquery';

export default Ember.Route.extend(AuthenticatedRouteMixin, {});

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
            this.transitionTo('browse', {queryParams: {subject: sub}});
        },
        togglePopularUploads() {
            var newHeight = ($('#landing-page-preprint-list').height() === 700) ? 2500 : 700;
            $('#landing-page-preprint-list').css('max-height', newHeight);
            $('#show-more-icon').toggleClass('fa fa-caret-down fa fa-caret-up');
        },
        search: function( q ) {
            this.transitionTo('browse', { queryParams: { query: q } } );
        }
    }
});
