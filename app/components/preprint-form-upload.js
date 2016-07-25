import Ember from 'ember';
import CpPanelBodyComponent from 'ember-collapsible-panel/components/cp-panel-body';
import PreprintFormFieldMixin from '../mixins/preprint-form-field';

// Enum of available states
export const State = Ember.Object.extend(Ember.Freezable, {
    START: 'start',
    NEW: 'new',
    EXISTING: 'existing'
}).create().freeze();

const component = CpPanelBodyComponent.extend(PreprintFormFieldMixin, {
    state: State.START,
    didRender() {
        this.set('valid', true);
    },
    actions: {
        changeState(newState) {
            this.set('state', newState);
        }
    }
});

component.reopen({
    _State: State
});

export default component;
