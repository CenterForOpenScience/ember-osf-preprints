import Ember from 'ember';
import CpPanelBodyComponent from 'ember-collapsible-panel/components/cp-panel-body';
import PreprintFormFieldMixin from '../mixins/preprint-form-field';

export default CpPanelBodyComponent.extend(PreprintFormFieldMixin, {
    classNames: ['row'],
    valid: Ember.computed.and('title', 'abstract'),
    didInsertElement() {
        // Make textarea fill vertical height
        this.$().height('auto');
        this.$('textarea').outerHeight(this.$().height() - this.$('span').height());
        this.$().height('');
    }
});
