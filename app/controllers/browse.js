import Ember from 'ember';

export default Ember.Controller.extend({
    queryParams: ['subjects', 'query'],
    subjects: null,
    query: null,

    store: Ember.inject.service(),

    filteredPreprints: Ember.computed('subjects', 'query', 'model', function() {
        let subjects = this.get('subjects');
        let query = this.get('query');
        let model = this.get('model').preprints;
        let store = this.get('store');

//        this.highlightSubject();

        let params = {};
        if (query) {
            // TODO: determine if fuzziness is necessary and how it should be applied if so
//            let fuzzyDelim = '~AUTO ';
//            let q = query.split(/ +/).filter(s => s !== "").map(s => s + fuzzyDelim).join(' ');
            params['q'] = query;
        }
        if (subjects) {
            // Array of subjects sent from taxonomy-tree is given as comma-separate string
            let subjectQuery = 'data.subject:(' + subjects.split(',').map(s => '"' + s + '"').join(' OR ') + ')';
            subjectQuery = query ? query + ' AND ' + subjectQuery : subjectQuery; // add AND if necessary
            params['q'] = subjectQuery;
        }
        // If neither query nor subject exists, just return the default model
        if (!Object.keys(params).length) {
            return model;
        }
        // Query store with accumulated parameters
        return store.query('preprint', params);
    }),

//    highlightSubject: function() {
//        let treeElem = $('#taxonomyTree')
//        if (treeElem.length) {
////            let selected = treeElem.treeview('getSelected');
////            for (var i = 0; i<selected.length; i++) {
////                treeElem.treeview('unselectNode', [selected[i].nodeId, {silent: true}])
////            }
//            let toHighlight = treeElem.treeview('search', [this.get('subject'), {
//                exactMatch: true,
//                revealResults: false
//            }]);
//            if (toHighlight.length){
//                treeElem.treeview('selectNode', [toHighlight[0].nodeId, {silent: true}]);
//            }
//
//        }
//    }
});
