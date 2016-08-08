import Ember from 'ember';
import CpPanelsComponent from 'ember-collapsible-panel/components/cp-panels';

export default CpPanelsComponent.extend({
    store: Ember.inject.service(),
    panelActions: Ember.inject.service(),
    elementId: 'preprint-form',
    accordion: true,
    _names: ['upload', 'basics', 'subjects', 'authors', 'submit'].map(str => str.capitalize()),
    valid: new Ember.Object(),
    actions: {
        verify(name, state) {
            this.get('valid').set(name, state);
        },
        next(name) {
            // Open next panel
            this.get('panelActions').open(this.get(`_names.${this.get('_names').indexOf(name) + 1}`));
        }
    }
});
