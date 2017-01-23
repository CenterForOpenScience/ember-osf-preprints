import Ember from 'ember';

export default Ember.Component.extend({
    metrics: Ember.inject.service(),
    actions: {
        search() {
            let query = Ember.$.trim(this.$('#searchBox').val());
            this.sendAction('search', query);
            Ember
                .get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Preprints - Index - Search'
                });
        }
    },

    keyDown(event) {
        // Search also activated when enter key is clicked
        if (event.keyCode === 13) {
            this.send('search');
        }
    }
});
