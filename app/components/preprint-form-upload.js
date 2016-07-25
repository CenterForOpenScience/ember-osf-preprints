import Ember from 'ember';
import CpPanelBodyComponent from 'ember-collapsible-panel/components/cp-panel-body';
import PreprintFormFieldMixin from '../mixins/preprint-form-field';

export default CpPanelBodyComponent.extend(PreprintFormFieldMixin, {
    didRender() {
        this.set('valid', true);
    }
});
