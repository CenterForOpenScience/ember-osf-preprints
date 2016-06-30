import Ember from 'ember';
import $ from 'jquery';

export default Ember.Component.extend({
    actions: {
        search(self) {
            self = self ? self : this; // Handle context switch for 'this' keyword
            let query = $('#searchBox').val();
            if (query != "") {
                self.sendAction("search", query);
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
