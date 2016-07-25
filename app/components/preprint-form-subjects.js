import Ember from 'ember';
import CpPanelBodyComponent from 'ember-collapsible-panel/components/cp-panel-body';
import PreprintFormFieldMixin from '../mixins/preprint-form-field';

export default CpPanelBodyComponent.extend(PreprintFormFieldMixin, {
    classNames: ['row'],
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
    subjects: {},
    valid: Ember.computed.oneWay('taxonomy'),
    actions: {
        select(type, value) {
            switch (type) {
                case 'taxonomy':
                    this.set('category', null);
                    /* falls through */
                case 'category':
                    this.set(type, value);
                    break;
                case 'subject':
                    if (this.get(`subjects.${value}`)) {
                        this.set(`subjects.${value}`, false);
                    } else {
                        this.set(`subjects.${value}`, true);
                    }
            }
        }
    }
});
