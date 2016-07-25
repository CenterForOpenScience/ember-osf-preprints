import Ember from 'ember';
import CpPanelsComponent from 'ember-collapsible-panel/components/cp-panels';

export default CpPanelsComponent.extend({
    store: Ember.inject.service(),
    elementId: 'preprint-form',
    accordion: true,
    _names: ['upload', 'basics', 'subjects', 'authors', 'submit'].map(str => str.capitalize()),
    verified: [false, false, false, false],
    enabled: [false, false, false, false],
    _checkEnabled: function() {
        const self = this.get('enabled');
        this.set('enabled', this.get('verified').map((el, index) => el || self[index]));
    }.observes('verified', 'verified.[]'),
    actions: {
        verify(name, state) {
            // Update verified array
            const index = this.get('_names').indexOf(name);
            // Force array update
            this.get('verified').removeAt(index);
            this.get('verified').insertAt(index, state);
        },
        select(name, resolve) {
            if (this.get('enabled').slice(0, this.get('_names').indexOf(name)).every(field => field)) {
                resolve();
            }
        }
    }
});
