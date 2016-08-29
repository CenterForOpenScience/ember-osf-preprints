import Ember from 'ember';

var pageSize = 150;

export default Ember.Component.extend({
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
        var _this = this;
        this.get('store').query('taxonomy', { filter: { parents: 'null' }, page: { size: pageSize } }).then(function(results) {
                _this.set('topLevelItem', _this.get('_parseResults')(results));
            }
        );
    },
    actions: {
        select(item) {
            this.attrs.select(item);
        },
        expand(item) {
            if (item.showChildren) {
                Ember.set(item, 'showChildren', false);
                return;
            }
            let children = item.children;
            if (children && children.length > 0) {
                Ember.set(item, 'showChildren', true);
                return;
            }
            var _this = this;
            this.get('store').query('taxonomy', { filter: { parents: item.id }, page: { size: pageSize } }).then(function(results) {
                    Ember.set(item, 'children', _this.get('_parseResults')(results));
                    Ember.set(item, 'showChildren', true);
                }
            );
        }
    }
});
