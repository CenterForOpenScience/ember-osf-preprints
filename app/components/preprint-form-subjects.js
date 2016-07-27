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
    selected: new Ember.Object(),
    valid: Ember.computed.oneWay('taxonomy'),
    actions: {
        select(type, value) {
            switch (type) {
                case 'taxonomy':
                    if (!this.get(`selected.${value}`)) {
                        this.set(`selected.${value}`, new Ember.Object());
                    }
                    this.set('category', null);
                    this.set(type, value);
                    break;
                case 'category':
                    if (!this.get(`selected.${this.get('taxonomy')}`)) {
                        this.set(`selected.${this.get('taxonomy')}`, new Ember.Object());
                    }
                    if (!this.get(`selected.${this.get('taxonomy')}.${value}`)) {
                        this.set(`selected.${this.get('taxonomy')}.${value}`, new Ember.Object());
                    }
                    this.set(type, value);
                    break;
                case 'subject':
                    const prop = `selected.${this.get('taxonomy')}.${this.get('category')}.${value}`;
                    if (this.get(prop)) {
                        this.set(prop, null);
                        delete this.selected[this.get('taxonomy')][this.get('category')][value];
                    } else {
                        this.set(prop, true);
                    }
            }
            this.rerender();
        }
    }
});
