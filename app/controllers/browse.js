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

        let params = {};
        if (query) {
            params['q'] = 'title:' + query;
        }
        if (subject) {
            params["filter[subject]"] = subject;
        }
        // If neither query nor subject exists, just return the default model
        if (params === {}) {
            return model;
        }
        // Query store with accumulated parameters
        return store.query('preprint', params);
    })
});
