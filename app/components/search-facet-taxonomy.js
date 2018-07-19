import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, set } from '@ember/object';
import Analytics from 'ember-osf/mixins/analytics';

const pageSize = 150;
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Builds taxonomy facet for discover page - to be used with Ember-OSF's discover-page component.
 *
 * Sample usage:
 * ```handlebars
 * {{search-facet-taxonomy
 *      updateFilters=(action 'updateFilters')
 *      options=facet
 *      filterReplace=filterReplace
 *      key=key
 * }}
 * ```
 * @class search-facet-taxonomy
 */
export default Component.extend(Analytics, {
    theme: service(),
    // Creates a list of all of the subject paths that need to be selected
    expandedList: computed('state.value', function() {
        const filters = this.get('state.value');
        const expandList = [];
        filters.forEach((filter) => {
            let filterStr = '';
            filter.split('|').forEach((item) => {
                if (item !== '') { filterStr += `|${item}`; }
                if (!expandList.includes(filterStr) && filterStr) {
                    expandList.push(filterStr);
                }
            });
        });
        return expandList;
    }),
    init() {
        this._super(...arguments);
        const component = this;
        const items = [];

        this._getTaxonomies()
            .then(results => this._prepareForExpansion(results, component, items));
    },
    actions: {
        expand(item) {
            this.get('metrics')
                .trackEvent({
                    category: 'tree',
                    action: item.showChildren ? 'contract' : 'expand',
                    label: `Discover - ${item.text}`,
                });
            this._expand(item);
        },
    },
    _getTaxonomies(parents = 'null') {
        return this
            .get('theme.provider')
            .then(provider => provider
                .queryHasMany('taxonomies', {
                    filter: { parents },
                    page: { size: pageSize },
                }))
            .then(results => results
                .map(result => ({
                    id: result.id,
                    text: result.get('text'),
                    children: [],
                    showChildren: false,
                    childCount: result.get('child_count'),
                    shareTitle: result.get('shareTitle'),
                    path: result.get('path'),
                }))
                .sort((prev, next) => {
                    if (prev.text > next.text) {
                        return 1;
                    } else if (prev.text < next.text) {
                        return -1;
                    }
                    return 0;
                }));
    },
    _prepareForExpansion(results, component, items) {
        this.set('topLevelItem', results);
        results.forEach((result) => {
            component.get('expandedList').forEach((element) => {
                if (element.includes(`${result.path}|`)) {
                    if (!items.includes(result)) {
                        items.push(result);
                    }
                }
            });
        });
        this._expandMany(items);
        // Only auto-expand if no subjects are selected.
        if (items.length === 0) {
            this._expandDefault();
        }
    },

    _expandDefault() {
        const topLevelItem = this.get('topLevelItem');
        if (topLevelItem.length <= 3) {
            topLevelItem.forEach((item) => {
                this._expand(item).then(this._expandEachChild.bind(this));
            });
        }
    },

    _expand(item) {
        if (item.showChildren) {
            set(item, 'showChildren', false);
            return;
        }
        const { children } = item.children;

        if (children && children.length > 0) {
            set(item, 'showChildren', true);
            return;
        }

        this.set('item', item);

        return this._getTaxonomies(item.id)
            .then(results => this._setResults(results, item));
    },
    // Runs through the expandedList.  If the subject's path is in the list,
    // then add it to the list.  Recursively runs through the list and expands.
    _expandMany(items) {
        this.set('items', items);

        if (items.length) {
            this._expand(items.shift()).then(this._recursiveExpandMany.bind(this));
        }
    },

    _expandEachChild(item) {
        if (item.children && item.childCount <= 3) {
            item.children.forEach((item) => {
                this._expand(item);
            });
        }
    },

    _setItemChildren(results) {
        const item = this.get('item');

        set(item, 'children', results);
        set(item, 'showChildren', true);
        return results;
    },
    _setResults(results, item) {
        set(item, 'children', results);
        set(item, 'showChildren', true);
        return results;
    },
    _recursiveExpandMany(results) {
        const component = this;
        const items = this.get('items');

        results.forEach((result) => {
            component.get('expandedList').forEach((element) => {
                if (element.includes(`${result.path}|`)) {
                    if (!items.includes(result)) {
                        items.push(result);
                    }
                }
            });
        });

        component._expandMany(items);
    },
});
