import Ember from 'ember';

export default Ember.Controller.extend({
    queryParams: ['subject', 'query'],
    subject: null,
    query: null,

    store: Ember.inject.service(),

    filteredPreprints: Ember.computed('subject', 'query', 'model', function() {
        let subject = this.get('subject');
        let query = this.get('query');
        let model = this.get('model');
        let store = this.get('store');

        if (query) {
            return store.query('preprint', { 'q': "title:" + query + "*" });
        } else if (subject) {
            let toReturn = store.query('preprint', { "filter[subject]": subject }).then(function(results) {
                debugger;
            });

            return toReturn;
        } else {
            return model;
        }
    })
});
