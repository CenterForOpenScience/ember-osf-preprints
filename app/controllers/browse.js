import Ember from 'ember';

export default Ember.Controller.extend({
    queryParams: ['subjects', 'query'],
    subjects: null,
    query: null,

    store: Ember.inject.service(),

    filteredPreprints: Ember.computed('subjects', 'query', 'model', function() {
        const subjects = this.get('subjects');
        const query = this.get('query');
        const model = this.get('model.preprints');
        const store = this.get('store');

        // TODO: highlight the subject in the tree if reaching this page from a "browse by subject" link, like on front page

        let params = {};
        if (query) {
            // TODO: determine if fuzziness is necessary and how it should be applied if so
            // let fuzzyDelim = '~AUTO ';
            //  let q = query.split(/ +/).filter(s => s !== "").map(s => s + fuzzyDelim).join(' ');
            params.q = query;
        }
        if (subjects) {
            // Set subjects to be just the subject clicked (guaranteed to be the first listed), not all that are searched
            this.set('subjects', subjects.split(',')[0]);
            // Array of subjects sent from taxonomy-tree is given as comma-separate string
            let subjectQuery = `data.subject:(${subjects.split(',').map(s => `"${s}"`).join(' OR ')})`;
            subjectQuery = query ? `${query} AND ${subjectQuery}` : subjectQuery; // add AND if necessary
            params.q = subjectQuery;
        }
        // If neither query nor subject exists, just return the default model
        if (!Object.keys(params).length) {
            return model;
        }
        // Query store with accumulated parameters
        return store.query('preprint', params);
    }),

});
