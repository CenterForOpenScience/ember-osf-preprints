import Ember from 'ember';

export default Ember.Component.extend({
    store: Ember.inject.service(),
    cache: {},
    init() {
        this._super(...arguments);
        var _this = this;
        this.get('store').query('taxonomy', {filter: {parent_ids: 'null'}, page: {size: 100}}).then(function(results){
                var topLevel = [];
                results.map(function(result){
                    topLevel.push({
                        id: result.id,
                        text: result.get('text'),
                        children: [],
                        showChildren: false
                    })
                })
                _this.set('topLevelItem', topLevel);
            }
        )
    },
    actions: {
        select(item) {
            this.attrs.select(item);
        },
        expand(item) {
            if (item.showChildren){
                Ember.set(item, 'showChildren', false);
                return;
            };
            let children = item.children;
            if (children && children.length > 0) {
                Ember.set(item, 'showChildren', true);
                return;
            };
            this.get('store').query('taxonomy', {filter: {parent_ids: item.id}, page: {size: 100}}).then(function(results){
                    var topLevel = [];
                    results.map(function(result){
                        topLevel.push({
                            id: result.id,
                            text: result.get('text'),
                            children: [],
                            showChildren: false
                        })
                    })
                    Ember.set(item, 'children', topLevel);
                    Ember.set(item, 'showChildren', true);
                }
            )
        }
    }
});
