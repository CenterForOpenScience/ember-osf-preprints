import Component from '@ember/component';
import { computed } from '@ember/object';


/**
 * Copied from Ember-SHARE.
 *
 * ```handlebars
 * {{search-facet-worktype
 *      key=facet.key
 *      options=facet
 *      state=(get facetStates facet.key)
 *      onChange=(action 'facetChanged')
 * }}
 * ```
 * @class search-facet-worktype-hierarchy
 */
export default Component.extend({
    category: 'filter-facets',

    selected: computed('state', function() {
        return this.get('state') || [];
    }),

    init() {
        this._super(...arguments);
        this.set('toggleState', this.get('defaultCollapsed'));
    },

    actions: {
        toggle(type) {
            this.get('onClick')(type);
        },

        toggleBody() {
            this.toggleProperty('toggleState');
        },
    },
});
