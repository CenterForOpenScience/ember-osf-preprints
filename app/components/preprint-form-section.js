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
    }.observes('isOpen'),
    handleToggle() {
        // Prevent closing all views
        if (!this.get('isOpen')) {
            this._super(...arguments);
        }
    }
});
