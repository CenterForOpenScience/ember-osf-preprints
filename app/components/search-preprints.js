import { inject as service } from '@ember/service';
import $ from 'jquery';
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
    metrics: service(),
    theme: service(),
    actions: {
        search() {
            const query = $.trim(this.$('#searchBox').val());
            /* eslint-disable-next-line ember/closure-actions */
            this.sendAction('search', query);
            this.get('metrics').trackEvent({
                category: 'button',
                action: 'click',
                label: 'Index - Search',
                extra: query,
            });
        },
    },

    keyDown(event) {
        // Search also activated when enter key is clicked
        if (event.keyCode === 13) {
            this.send('search');
        }
    },
});
