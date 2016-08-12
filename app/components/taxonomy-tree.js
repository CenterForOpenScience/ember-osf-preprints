import Ember from 'ember';

export default Ember.Component.extend({
    store: Ember.inject.service(),

    // https://github.com/jonmiles/bootstrap-treeview
    didInsertElement() {
        // this.get('store').query('taxonomy', { 'field[\'parent_ids\']': null, 'page[size]': 200 }).then(topLevel => {
        // TODO: populate tree lazily with filterable taxonomy endpoint
        this.$('#taxonomyTree').treeview({
            data: [],
            levels: 1,
            highlightSelected: false,
            showBorder: false,
            showCheckbox: true,
            collapseIcon: 'glyphicon glyphicon-triangle-bottom',
            expandIcon: 'glyphicon glyphicon-triangle-right',

            onNodeSelected: (event, data) => {
                /*
                let getSubjects = (d, subjects) => {
                    subjects.push(d.text);
                    // Base case: leaf node
                    if (!d.nodes) {
                        return subjects;
                    }
                    // Recursive case, add on results from recursing onto child nodes
                    for (let node of d.nodes) {
                        subjects.concat(getSubjects(node, subjects));
                    }
                    return subjects;
                };

                if (data.text === 'All subjects') {
                    this.sendAction('filter', null);
                } else {
                    // Make call to recursive function with initially empty list
                    this.sendAction('filter', getSubjects(data, []));
                }
                */

                // getChecked() is a valid method, but it's not in the README for bootstrap-treeview

                this.$('#taxonomyTree').treeview('toggleNodeChecked', [data.nodeId, { silent: true }]);
            }
        });
        // });
    },
});
