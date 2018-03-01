import Ember from 'ember';
import CpPanelComponent from 'ember-collapsible-panel/components/cp-panel';
import Analytics from 'ember-osf/mixins/analytics';
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Extends Ember Collapsible Panel's CpPanelComponent. Preprint-form-header and preprint-form-body components go inside.
 *
 * Sample usage:
 * ```handlebars
 * {{#preprint-form-section class="upload-section-block" allowOpen=false name='locationOfPreprint' open=false}}
 *    {{preprint-form-header}}
 *    {{#preprint-form-body}}
 *    {{/preprint-form-body}}
 * {{/preprint-form-section}}
 * ```
 * @class preprint-form-section
 **/

export default CpPanelComponent.extend(Analytics, {
    i18n: Ember.inject.service(),

    tagName: 'section',
    classNames: ['preprint-form-section'],
    animate: false,

    /**
     * Prevent toggling into form section if file has not been uploaded
     * @property {boolean} allowOpen
     */
    allowOpen: false,

    /**
     * Track whether this panel has ever been opened (eg to suppress validation indicators until page is viewed)
     * @property {boolean} hasOpened
     */
    hasOpened: false,

    trackOpenState: Ember.observer('isOpen', function() {
        // Whenever panel is opened (via any means), update the hasOpened state to reflect this fact
        let isOpen = this.get('isOpen');
        if (isOpen) {
            this.set('hasOpened', true);
        }
    }),

    // Fix deprecation warning
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
            if (this.get('allowOpen')) {
                // Crude mechanism to prevent opening a panel if conditions are not met
                Ember.get(this, 'metrics')
                    .trackEvent({
                        category: 'div',
                        action: 'click',
                        label: `${this.get('editMode') ? 'Edit' : 'Submit'} - Click to edit, ${this.name} section`
                    });
                this._super(...arguments);
            } else {
                this.sendAction('errorAction', this.get('denyOpenMessage'));
            }
        }
    },

    didReceiveAttrs() {
        if (this.get('denyOpenMessage') === undefined) {
            this.set('denyOpenMessage', this.get('i18n').t('submit.please_complete_upload'));
        }
    },
});
