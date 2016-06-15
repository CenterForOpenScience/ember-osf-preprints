import Ember from 'ember';

export default Ember.Component.extend({
    store: Ember.inject.service(),

    didInsertElement() {
        this.get('store').findAll('taxonomy').then(function(taxonomy) {
            $('#taxonomyTree').treeview({
                data: taxonomy.get('firstObject').get('tree'),
                levels: 1
            }
            );
        });

    }
});
