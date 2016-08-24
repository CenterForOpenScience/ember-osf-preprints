import Ember from 'ember';
import CpPanelToggleComponent from 'ember-collapsible-panel/components/cp-panel-toggle';

export default CpPanelToggleComponent.extend({
    tagName: 'header',
    // Variables to pass in
    enabled: true,
    showValidationIndicator: true,
    valid: null,
    isValidationActive: false,

    // Calculated properties
    noValidation: Ember.computed.empty('valid'),

    invalid: Ember.computed('valid', function() {
        // If the user hasn't even opened the panel yet, don't run the validation check
        // In other words, not true or null
        if (this.get('isValidationActive')) {
            return this.get('valid') === false;
        } else {
            return false;
        }
    }),
    // CSS controls icon color and display. If neither valid nor invalid state applies, don't show icon.
    classNameBindings: ['enabled::disabled', 'valid:valid', 'invalid:invalid', 'isValidationActive::not-validated']
});
