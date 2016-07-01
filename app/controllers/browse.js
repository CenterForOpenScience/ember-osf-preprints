import Ember from 'ember';

export default Ember.Controller.extend({
    queryParams: ['subject', 'query'],
    subject: null,
    query: null,

    store: Ember.inject.service(),

    filteredPreprints: Ember.computed('subject', 'query', 'model', function() {
        let subject = this.get('subject');
        let query = this.get('query');
        let model = this.get('model').preprints;
        let store = this.get('store');

//        this.highlightSubject();

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
