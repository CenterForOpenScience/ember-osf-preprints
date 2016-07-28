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
    taxonomy: null,
    path: [],
    selected: new Ember.Object(),
    valid: Ember.computed.oneWay('taxonomy'),
    actions: {
        delete(key) {
            this.set(key, null);
            eval(`delete this.${key}`);
        },
        deselect(...args) {
            this.send('delete', `selected.${args.slice(0, args.length - 1).join('.')}`);
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
            process(args.reduce(process), '', args.length);
            this.set('path', args);
            this.rerender();
        }
    }
});
