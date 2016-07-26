import Ember from 'ember';
import CpPanelComponent from 'ember-collapsible-panel/components/cp-panel';

export default CpPanelComponent.extend({
    tagName: 'section',
    classNames: ['preprint-form-section'],
    animate: false,
    slideAnimation: function() {
        if (this.get('animate')) {
            // Allow liquid-fire to animate
            return;
        }
        const $body = this.$('.cp-Panel-body');
        if (this.get('isOpen')) {
            $body.height('auto');
            $body.height($body.height());
        } else {
            $body.height('');
        }
    }.observes('isOpen'),
    handleToggle() {
        // Prevent closing all views
        if (!this.get('isOpen')) {
            this._super(...arguments);
        }
    }
});
