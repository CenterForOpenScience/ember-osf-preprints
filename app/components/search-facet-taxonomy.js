import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import { get } from '@ember/object';
import { set } from '@ember/object';
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
 *      activeFilters=activeFilters
 *      options=facet
 *      filterReplace=filterReplace
 *      key=key
 * }}
 * ```
 * @class search-facet-taxonomy
 */
export default Component.extend(Analytics, {
    theme: inject(),
    _getTaxonomies(parents = 'null') {
        return this
            .get('theme.provider')
            .then(provider => provider
                .queryHasMany('taxonomies', {
                    filter: { parents },
                    page: { size: pageSize }
                })
            )
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
                })
            );
    },
    // Creates a list of all of the subject paths that need to be selected
    expandedList: computed('activeFilters.subjects', function() {
        const filters = this.get('activeFilters.subjects');
        let expandList = [];
        filters.forEach(filter => {
            let filterStr = '';
            filter.split('|').forEach(item => {
                if (item !== '') { filterStr += '|' + item; }
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
        let items = [];

        this._getTaxonomies()
            .then(results => {
                this.set('topLevelItem', results);
                results.forEach(result => {
                    component.get('expandedList').forEach(element => {
                        if (element.includes(result.path + '|')) {
                            if (!items.includes(result)) {
                                items.push(result);
                            }
                        }
                    })
                });
                this._expandMany(items);
            });
    },
    actions: {
        expand(item) {
            get(this, 'metrics')
                .trackEvent({
                    category: 'tree',
                    action: item.showChildren ? 'contract' : 'expand',
                    label: `Discover - ${item.text}`
                });
            this._expand(item);
        }
    },
    _expand(item) {
        if (item.showChildren) {
            set(item, 'showChildren', false);
            return;
        }
        let children = item.children;

        if (children && children.length > 0) {
            set(item, 'showChildren', true);
            return;
        }
        return this._getTaxonomies(item.id)
            .then((results) => {
                set(item, 'children', results);
                set(item, 'showChildren', true);
                return results;
            });
    },
    // Runs through the expandedList.  If the subject's path is in the list,
    // then add it to the list.  Recursively runs through the list and expands.
    _expandMany(items) {
        const component = this;

        if (items.length) {
            this._expand(items.shift()).then(results => {
                results.forEach(result => {
                    component.get('expandedList').forEach(element => {
                        if (element.includes(result.path + '|')) {
                            if (!items.includes(result)) {
                                items.push(result);
                            }
                        }
                    });
                });
                component._expandMany(items);
            });
        }
    }
});
