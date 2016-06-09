import Ember from 'ember';
import $ from 'jquery';

export default Ember.Route.extend({
    model() {
        return Ember.RSVP.hash({
            preprints: this.store.findAll('preprint'),
            subjects: this.store.findAll('subject')
        });
    },
    actions: {
        filter: function(subjectToFilter) {
            if (subjectToFilter != null) {
                if ($('#'+subjectToFilter).hasClass("active")) {
                    this.transitionTo('browse-preprints', { queryParams: {subject: null} } );
                    $('#subjectList').children().removeClass("active");
                    $('#all').addClass("active");
                } else {
                    this.transitionTo('browse-preprints', { queryParams: {subject: subjectToFilter} } );
                    $('#subjectList').children().removeClass("active");
                    $('#'+subjectToFilter).addClass("active");
                }
            } else {
                this.transitionTo('browse-preprints', { queryParams: {subject: null} } );
                $('#subjectList').children().removeClass("active");
                $('#all').addClass("active");
            }

        }
    }
});


