import Ember from 'ember';

export default Ember.Component.extend({
    store: Ember.inject.service(),

    didInsertElement() {
        this.$('#taxonomyTree').treeview({
            data: this.get('tree').get('tree'),
            levels: 1,
//            selectedBackColor: '#67a3bf',
            showCheckbox: true,
            collapseIcon: 'glyphicon glyphicon-menu-down',
            expandIcon: 'glyphicon glyphicon-menu-right',

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

                this.$('#taxonomyTree').treeview('toggleNodeChecked', [ data.nodeId, { silent: true } ] );
            }
        });
    },

});
