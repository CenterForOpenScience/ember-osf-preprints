import Ember from 'ember';
import CpPanelBodyComponent from 'ember-collapsible-panel/components/cp-panel-body';
import PreprintFormFieldMixin from '../mixins/preprint-form-field';

export default CpPanelBodyComponent.extend(PreprintFormFieldMixin, {
    taxonomies: {
        'a': {
            'b': ['c', 'd', 'e'],
            'f': ['g']
        },
        'h': {
            'i': ['j','k']
        },
        'l': {}
    },
    sortedTaxonomies: Ember.computed('taxonomies', function() {
        return [{
            name: 'a',
            children: [{
                name: 'b',
                children: ['c', 'd', 'e']
            }, {
                name: 'f',
                children: ['g']
            }],
        }, {
            name: 'h',
            children: [{
                name: 'i',
                children: ['j', 'k']
            }]
        }, {
            name: 'l'
        }];
    }),
    taxonomy: null,
    path: [],
    selected: new Ember.Object(),
    // sortedSelection: Ember.computed('selected', function() {
    //     const selected = this.get('selected');
    //     const taxonomies = Object.keys(selected);
    //     const temp = taxonomies
    //         .map(taxonomy => selected.get(taxonomy))
    //         .filter(categories => categories);
    //     const categories = temp
    //         .reduce((prev, cur) => prev.concat(Object.keys(cur)), []);
    //     const subjects = temp
    //         .map(categories => Object.keys(categories)
    //             .map(category => categories.get(category))
    //             .filter(subjects => subjects)
    //             .reduce((prev, cur) => prev.concat(Object.keys(cur)), []))
    //         .reduce((prev, cur) => prev.concat(cur));
    //     return {
    //         taxonomies: taxonomies,
    //         categories: categories,
    //         subjects: subjects
    //     };
    // }),
    sortedSelection: Ember.computed('selected', function() {
        const sorted = [];
        const selected = this.get('selected');
        const flatten = ([obj, name = []]) => {
            const keys = Object.keys(obj);
            if (keys.length === 0) {
                return name.length !== 0 && sorted.pushObject(name);
            } else {
                return keys.sort().map(key => [obj.get(key), [...name, key]]).forEach(flatten);
            }
        };
        flatten([selected]);
        return sorted;
    }),
    valid: Ember.computed.oneWay('taxonomy'),
    actions: {
        delete(key) {
            this.set(key, null);
            eval(`delete this.${key}`);
        },
        deselect([...args]) {
            this.send('delete', `selected.${args.filter(arg => Ember.typeOf(arg) === 'string').join('.')}`);
            this.notifyPropertyChange('selected');
            this.rerender();
        },
        select(...args) {
            const process = (prev, cur, i) => {
                if (!this.get(`selected.${prev}`)) {
                    // Create necessary parent objects and newly selected object
                    this.set(`selected.${prev}`, new Ember.Object());
                } else if (i === 3) {
                    // Deselecting a subject
                    this.send('delete', `selected.${prev}`);
                }
                return `${prev}.${cur}`;
            };
            // Process past length of array
            process(args.map(arg => arg.name || arg).reduce(process), '', args.length);
            this.set('path', args);
            this.notifyPropertyChange('selected');
            this.rerender();
        }
    }
});
