import Ember from 'ember';
import Analytics from '../mixins/analytics';

var pageSize = 150;

export default Ember.Component.extend(Analytics, {
    store: Ember.inject.service(),
    cache: {},
    _parseResults(results) {
        var parsed = [];
        results.map(function(result) {
            parsed.push({
                id: result.id,
                text: result.get('text'),
                children: [],
                showChildren: false,
                childCount: result.get('child_count')
            });
        });
        return parsed.sort((prev, next) => {
            if (prev.text > next.text) {
                return 1;
            } else if (prev.text < next.text) {
                return -1;
            }
            return 0;
        });
    },
    init() {
        this._super(...arguments);
        this.get('store')
            .query('taxonomy', {
                filter: { parents: 'null' },
                page: { size: pageSize }
            })
            .then(results => this
                .set('topLevelItem', this.get('_parseResults')(results))
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
                    label: item.text
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
            this.get('store')
                .query('taxonomy', {
                    filter: { parents: item.id },
                    page: { size: pageSize }
                })
                .then(results => {
                    Ember.set(item, 'children', this.get('_parseResults')(results));
                    Ember.set(item, 'showChildren', true);
                }
            );
        }
    }
});
