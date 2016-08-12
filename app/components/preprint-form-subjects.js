import Ember from 'ember';
import CpPanelBodyComponent from 'ember-collapsible-panel/components/cp-panel-body';
import PreprintFormFieldMixin from '../mixins/preprint-form-field';

export default CpPanelBodyComponent.extend(PreprintFormFieldMixin, {
    store: Ember.inject.service(),
    filter: [{}, {}, {}],
    updateFilteredPath() {
        var _this = this;
        var overallPath = [];
        var paths = this.get('path').slice(0, 2);
        if (paths.length === 1) {
            _this.get('store').query('taxonomy', { filter: { parent_ids: paths[0].id}, page: {size: 100} }).then(results => {
                Ember.set(paths[0], 'children', results.map(
                    result => {return {name: result.get('text'), id: result.id};}
                ));
                overallPath.push(paths[0]);
                _this.set('filteredPath', overallPath);
            });
        } else if (paths.length === 2) {
            _this.get('store').query('taxonomy', { filter: { parent_ids: paths[0].id}, page: {size: 100} }).then(results => {
                Ember.set(paths[0], 'children', results.map(
                    result => {return {name: result.get('text'), id: result.id};}
                ));
                overallPath.push(paths[0]);
                _this.get('store').query('taxonomy', { filter: { parent_ids: paths[1].id}, page: {size: 100} }).then(results => {
                    Ember.set(paths[1], 'children', results.map(
                        result => {return {name: result.get('text'), id: result.id};}
                    ));
                    overallPath.push(paths[1]);
                    _this.set('filteredPath', overallPath);
                });
            });
        }
    },
    filteredPath: Ember.computed('path', 'changeFlag', 'filter', 'filter.@each.value', function() {
        this.updateFilteredPath();
    }),
    sortedTaxonomies: Ember.computed('taxonomies', 'filter', 'filter.0.value', function() {
        var self = this;
        this.get('store').query('taxonomy', { filter: { parent_ids: 'null'}, page: {size: 100} }).then(results => {
            self.set('sortedTaxonomies', results.map( result => {
                return {name: result.get('text'), id: result.get('id')};
            }));
        });
    }),
    path: [],
    selected: new Ember.Object(),
    sortedSelection: Ember.computed('selected', function() {
        const sorted = [];
        const selected = this.get('selected');
        const flatten = ([obj, name = []]) => {
            const keys = Object.keys(obj);
            if (keys.length === 0) {
                return name.length !== 0 && sorted.pushObject(name);
            } else {
                return keys.sort()
                    .map(key => [obj.get(key), [...name, key]])
                    .forEach(flatten);
            }
        };
        flatten([selected]);
        return sorted;
    }),
    valid: Ember.computed('selected', function() {
        return Object.keys((this.get('selected'))).length !== 0;
    }),
    actions: {
        delete(key, array = key.split('.')) {
            this.set(key, null);
            // Delete key manually
            switch (array.length) {
                case 2:
                    delete this[array[0]][array[1]];
                    break;
                case 3:
                    delete this[array[0]][array[1]][array[2]];
                    break;
                case 4:
                    delete this[array[0]][array[1]][array[2]][array[3]];
                    break;
                default:
                    console.error('deletion not implemented');
            }
        },
        deselect([...args]) {
            args = args.filter(arg => Ember.typeOf(arg) === 'string');
            this.send('delete', `selected.${args.join('.')}`, ['selected', ...args]);
            this.notifyPropertyChange('selected');
            this.rerender();
        },
        select(...args) {
            const process = (prev, cur, i, arr) => {
                const selected = this.get(`selected.${prev}`);
                if (!selected) {
                    // Create necessary parent objects and newly selected object
                    this.set(`selected.${prev}`, new Ember.Object());
                } else if (i === 3 || i === args.length && args.length === this.get('path').length &&
                    this.get('path').every((e, i) => e.name === args[i].name) &&
                    Object.keys(selected).length === 0) {
                    // Deselecting a subject: if subject is last item in args,
                    // its children are showing, and no children are selected
                    this.send('delete', `selected.${prev}`, ['selected', ...arr.splice(0, i)]);
                    args.popObject();
                }
                return `${prev}.${cur}`;
            };
            // Process past length of array
            [...args.map(arg => arg.name || arg), ''].reduce(process);
            this.set('path', args);
            this.updateFilteredPath();
            this.notifyPropertyChange('selected');
            this.rerender();
        }
    }
});
