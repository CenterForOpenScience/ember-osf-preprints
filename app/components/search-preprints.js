import Ember from 'ember';

export default Ember.Component.extend({
    actions: {
        search() {
            let query = Ember.$.trim(this.$('#searchBox').val());
            this.sendAction('search', query);
        }
    },

    keyDown(event) {
        // Search also activated when enter key is clicked
        if (event.keyCode === 13) {
            this.send('search');
        }
    }
});
