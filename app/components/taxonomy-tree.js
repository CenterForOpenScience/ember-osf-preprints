import Ember from 'ember';
import $ from 'jquery';

export default Ember.Component.extend({
    store: Ember.inject.service(),

    // JamDB

    /*
    didInsertElement() {
        this.get('store').find('taxonomy', 'top3levels')
        .then(function(taxonomy) {
            $('#taxonomyTree').treeview({
                data: taxonomy.get('attributes').tree,
                levels: 1,
                selectedBackColor: '#67a3bf',

                onNodeSelected: function(event, data) {
                    if (data.text == 'All subjects') {
                        this.sendAction('filter', null);
                    } else {
                        this.sendAction('filter', data.text);
                    }
//                    // How to iterate over the child nodes of given node
//                    for (var i=0; i<data.nodes.length; i++) {

//                    }
                }.bind(this)
            });
        }.bind(this));
    }
    */


});
