import { inject } from '@ember/service';
import $ from 'jquery';
import { get } from '@ember/object';
import Component from '@ember/component';

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
export default Component.extend({
    metrics: inject(),
    theme: inject(),
    actions: {
        search() {
            let query = $.trim(this.$('#searchBox').val());
            this.sendAction('search', query);
            get(this, 'metrics').trackEvent({
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
