import Ember from 'ember';

export default Ember.Component.extend({
    preprintId: Ember.computed('preprint', function() {
        return this.get('preprint').get('id')
    })
});

