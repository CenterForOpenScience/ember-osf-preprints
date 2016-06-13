import Ember from 'ember';
import $ from 'jquery';

export default Ember.Controller.extend({
    queryParams: ['subject', 'subjectID'],
    subject: null,
    subjectID: null,

    refreshPage: function() {
        var subjectToFilter = this.get('subject');
        var id = this.get('subjectID');

        $('#subjectList').children().removeClass("active");

        if (subjectToFilter != null) {
            $('#'+id).addClass("active");
        } else {
            $('#all').addClass("active");
        }
    },

    filteredPreprints: Ember.computed('subject', 'model', function() {
        var id = this.get('subjectID');
        if (id != null && $('#'+id).hasClass("active")) {
            this.set('subject', null);
            this.set('subjectID', null);
        }

        this.refreshPage();

        var subject = this.get('subject');
        var preprints = this.get('model').preprints;

        if (subject) {
            return preprints.filterBy('subject', subject);
        } else {
            return preprints;
        }
    })

});
