import Ember from 'ember';
import CpPanelToggleComponent from 'ember-collapsible-panel/components/cp-panel-toggle';

export default CpPanelToggleComponent.extend({
    tagName: 'header',
    enabled: true,
    invalid: Ember.computed('valid', function() {
        // In other words, not true or undefined
        return this.get('valid') === false;
    }),
    classNameBindings: ['enabled::disabled', 'valid:valid', 'invalid:invalid']
});
