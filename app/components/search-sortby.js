import Ember from 'ember';

export default Ember.Component.extend({
    options: ['Relevance', 'Upload date (oldest to newest)', 'Upload date (newest to oldest)'],
    chosenOption: function() {
        return this.options[0];
    }.property('options'),

    actions: {
        select(index) {
            // Swap selected option with first
            let copy = this.get('options').slice(0);
            let temp = copy[0];
            copy[0] = copy[index];
            copy[index] = temp;
            this.set('options', copy);
        }
    }
});
