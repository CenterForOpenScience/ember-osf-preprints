import Ember from 'ember';
import CpPanelComponent from 'ember-collapsible-panel/components/cp-panel';

export default CpPanelComponent.extend({
    tagName: 'section',
    classNames: ['preprint-form-section'],
    animate: false,
    // Fix depreciation warning
    _setup: Ember.on('init', Ember.observer('open', function() {
        this.set('panelState.boundOpenState', this.get('open'));
    })),
    /* Manual animation
     * Can be omitted if using {{cp-panel-body}} instead of {{preprint-form-body}} because
     * cp-panel-body uses liquid-if for animation. preprint-form-body purposely avoids liquid-if
     * because liquid-if will cause elements to be removed from DOM. This is can cause some
     * information to be lost (e.g. dropzone state).
     */
    slideAnimation: Ember.observer('isOpen', function() {
        if (this.get('animate')) {
            // Allow liquid-fire to animate
            return;
        }
        const $body = this.$('.cp-Panel-body');
        if (this.get('isOpen')) {
            $body.height('auto');
            $body.height($body.height());
            $body.one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', () => {
                $body.addClass('no-transition');
                $body.height('');
                $body[0].offsetHeight; // jshint ignore: line
                $body.removeClass('no-transition');
            });
        } else {
            $body.addClass('no-transition');
            $body.height($body.height());
            $body[0].offsetHeight; // jshint ignore: line
            $body.removeClass('no-transition');
            $body.height('');
        }
    }),
    // Called when panel is toggled
    handleToggle() {
        // Prevent closing all views
        if (!this.get('isOpen')) {
            this._super(...arguments);
        }
    }
});
