import Ember from 'ember';
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Search bar and search button
 *
 * Sample usage:
 * ```handlebars
 * {{search-preprints
 *  search="search"
}}
 * ```
 * @class search-preprints
 */
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
                    label: 'Index - Search',
                    extra: query
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
