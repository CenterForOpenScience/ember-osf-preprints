import Ember from 'ember';

export default Ember.Controller.extend({
    queryParams: ['subject'],
    subject: null,

    filteredPreprints: Ember.computed('subject', 'model', function() {
        var subject = this.get('subject');
        var preprints = this.get('model').preprints;

        if (subject) {
            return preprints.filterBy('subject', subject);
        } else {
            return preprints;
        }
    })
});
