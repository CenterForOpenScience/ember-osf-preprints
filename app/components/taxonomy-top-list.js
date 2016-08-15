import Ember from 'ember';

export default Ember.Component.extend({
    sortedList: Ember.computed('list', 'list.content', function() {
        if (!this.get('list')) {
            return;
        }
        const sortedList = this.get('list').sortBy('text');
        const pairedList = [];
        for (let i = 0; i < sortedList.get('length'); i += 2) {
            pairedList.pushObject([sortedList.objectAt(i), sortedList.objectAt(i + 1)]);
        }
        return pairedList;
    })
});
