import Ember from 'ember';
import CpPanelToggleComponent from 'ember-collapsible-panel/components/cp-panel-toggle';

export default CpPanelToggleComponent.extend({
    tagName: 'header',
    enabled: true,
    classNameBindings: ['enabled::disabled']
});
