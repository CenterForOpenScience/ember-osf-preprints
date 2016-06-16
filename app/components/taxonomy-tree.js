import Ember from 'ember';
import $ from 'jquery';

export default Ember.Component.extend({
    store: Ember.inject.service(),


    didInsertElement() {
        this.get('store').findAll('taxonomy').then(function(taxonomy) {
            $('#taxonomyTree').treeview({
                data: taxonomy.get('firstObject').get('tree'),
                levels: 1,
                selectedBackColor: '#67a3bf',

                onNodeSelected: function(event, data) {
                    if (data.text == 'All subjects') {
                        this.sendAction('filter', null);
                    } else {
                        this.sendAction('filter', data.text);
                    }
                }.bind(this)
            });
        }.bind(this));
    }

});
