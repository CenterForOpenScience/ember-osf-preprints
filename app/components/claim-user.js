import Component from '@ember/component';
import Analytics from 'ember-osf/mixins/analytics';
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Confirm share preprint modal
 *
 * Requires user to confirm they wish to submit their preprint,
 * thus making it public and searchable
 *
 * Sample usage:
 * ```handlebars
 * {{confirm-share-preprint
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
    showPopup: false,
    actions: {
        hidePopup() {
            this.set('showPopup', false);
        },
        togglePopup() {
            this.toggleProperty('showPopup');
        },
    },
});
