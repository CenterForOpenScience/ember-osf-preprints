import Ember from 'ember';
import Analytics from '../mixins/analytics';

const pageSize = 150;
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Builds hierarchy of taxonomies for discover page
 *
 * Sample usage:
 * ```handlebars
 * {{taxonomy-tree
 *      select=(action 'updateFilters' 'subjects')
 *      subjects=treeSubjects}}
 * }}
 * ```
 * @namespace component
 */
export default Ember.Component.extend(Analytics, {
    theme: Ember.inject.service(),
    _getTaxonomies(parents = 'null') {
        return this
            .get('theme.provider')
            .then(provider => provider
                .query('taxonomies', {
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
                    childCount: result.get('child_count')
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
    init() {
        this._super(...arguments);

        this._getTaxonomies()
            .then(results => this
                .set('topLevelItem', results)
            );
    },
    actions: {
        select(item) {
            this.attrs.select(item);
        },
        expand(item) {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'tree',
                    action: item.showChildren ? 'contract' : 'expand',
                    label: `Preprints - Discover - ${item.text}`
                });

            if (item.showChildren) {
                Ember.set(item, 'showChildren', false);
                return;
            }

            const children = item.children;

            if (children && children.length > 0) {
                Ember.set(item, 'showChildren', true);
                return;
            }

            this._getTaxonomies(item.id)
                .then(results => {
                    Ember.set(item, 'children', results);
                    Ember.set(item, 'showChildren', true);
                }
            );
        }
    }
});
