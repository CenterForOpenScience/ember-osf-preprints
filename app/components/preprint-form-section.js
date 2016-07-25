import Ember from 'ember';
import CpPanelComponent from 'ember-collapsible-panel/components/cp-panel';

export default CpPanelComponent.extend({
    tagName: 'section',
    handleToggle() {
        // Prevent closing all views
        if (!this.get('isOpen')) {
            this.get('select')(() => this._super(...arguments));
        }
    }
});
