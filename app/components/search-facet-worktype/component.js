import Component from '@ember/component';
import { computed } from '@ember/object';

import { getUniqueList } from 'ember-osf/utils/elastic-query';

/**
 * Copied from Ember-SHARE.  Type facet.
 *
 * ```handlebars
 * {{search-facet-worktype
 *      key=facet.key
 *      options=facet
 *      state=(get facetStates facet.key)
 *      onChange=(action 'facetChanged')
 * }}
 * ```
 * @class search-facet-worktype
 */
export default Component.extend({
    category: 'filter-facets',

    selected: computed('state.value.[]', function() {
        return this.get('state.value') || [];
    }),

    actions: {
        setState(selected) {
            this.get('updateFacet')(this.get('key'), getUniqueList(selected));
        },

        toggle(type) {
            let selected = this.get('selected');
            selected = selected.includes(type) ? [] : [type];
            this.send('setState', selected);
        },
    },
});
