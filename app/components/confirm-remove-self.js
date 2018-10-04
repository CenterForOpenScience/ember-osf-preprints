import Component from '@ember/component';
import Analytics from 'ember-osf/mixins/analytics';
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Confirm remove self component
 *
 * Requires user to confirm they wish to remove
 * themselves from the preprint
 *
 * Sample usage:
 * ```handlebars
 * {{confirm-remove-self
 *  isOpen=showModalSharePreprint
 *  shareButtonDisabled=shareButtonDisabled
 *  savePreprint=(action 'savePreprint')
 *  title=title
 *  buttonLabel=buttonLabel
 *}}
 * ```
 * @class confirm-share-preprint
 */
export default Component.extend(Analytics, {
    isOpen: false,
    actions: {
        close() {
            this.get('metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Edit - Confirm remove self from preprint',
                });
            this.set('isOpen', false);
        },
    },
});
