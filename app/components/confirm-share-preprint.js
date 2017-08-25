import Ember from 'ember';
import Analytics from 'ember-osf/mixins/analytics';
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Confirm share preprint modal - Requires user to confirm they wish to submit their preprint, thus making it public and searchable
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
export default Ember.Component.extend(Analytics, {
    isOpen: false,
    actions: {
        close() {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Submit - Cancel Share Preprint'
                });
            this.set('isOpen', false);
        }
    }
});
