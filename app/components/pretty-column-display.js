import Ember from 'ember';

export default Ember.Component.extend({
    length: 4,
    topItems: Ember.computed('items', 'length', function() {
        let ar = this.get('items');
        return ar.slice(0, ar.length - (ar.length % this.get('length')));
    }),
    bottomItems: Ember.computed('items', 'length', function() {
        let ar = this.get('items');
        return ar.slice(-(ar.length % this.get('length')));
    }),
    columnLength: Ember.computed('length', function() {
        if (12 % this.get('length')) {
            this.set('length', 4);
            return 3;
        }
        return 12/this.get('length');
    }),
    bottomColumnLength: Ember.computed('bottomItems', function() {
        return 12/this.get('bottomItems.length');
    })
});
