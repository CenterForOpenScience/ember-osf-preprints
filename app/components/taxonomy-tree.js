import Ember from 'ember';
import $ from 'jquery';

export default Ember.Component.extend({
    store: Ember.inject.service(),

    didInsertElement() {
        $('#taxonomyTree').treeview({
            data: this.get('tree').get('tree'),
            levels: 1,
            selectedBackColor: '#67a3bf',

            onNodeSelected: function(event, data) {
                // Recurse down from this subject to filter by all subcategories as well
                let getSubjects = (d, subjects) => {
                    subjects.push(d.text[0]);
                    // Base case: leaf node
                    if (!d.nodes) {
                        return subjects;
                    }
                    // Recursive case, add on results from recursing onto child nodes
                    for (let i=0; i<d.nodes.length; i++) {
                        subjects.concat(getSubjects(d.nodes[i], subjects));
                    }
                    return subjects;
                };

                if (data.text == 'All subjects') {
                    this.sendAction('filter', null);
                } else {
                    // Make call to recursive function with initially empty list
                    this.sendAction('filter', getSubjects(data, []));
                }
            }.bind(this)
        });
    },

});
