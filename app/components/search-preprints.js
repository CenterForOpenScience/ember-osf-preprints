import Ember from 'ember';

export default Ember.Component.extend({
    actions: {
        search(self) {
            self = self ? self : this; // Handle context switch for 'this' keyword
            let query = this.$('#searchBox').val();
            if (query && query != ""){
                self.sendAction("search", query);
            } else {
                self.sendAction("search", null);
            }
        }
    },

    keyDown: function(event) {
        // Search also activated when enter key is clicked
        if (event.keyCode == 13) {
            this.actions.search(this);
        }
    }
});
