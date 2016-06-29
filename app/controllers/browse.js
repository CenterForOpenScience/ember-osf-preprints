import Ember from 'ember';

export default Ember.Controller.extend({
    queryParams: ['subject'],
    subject: null,

    store: Ember.inject.service(),

    filteredPreprints: Ember.computed('subject', 'model', function() {
        let subject = this.get('subject');
        let model = this.get('model');
        let store = this.get('store');

        if (subject) {
            return store.query('preprint', { "filter[subject]": subject });
        } else {
            return model;
        }
    })
});
