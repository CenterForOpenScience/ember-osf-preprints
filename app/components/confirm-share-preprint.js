import Ember from 'ember';
import Analytics from '../mixins/analytics';

/**
 * Confirm share preprint modal - Requires user to confirm they wish to submit their preprint, thus making it public and searchable
 *
 * Sample usage:
 * ```handlebars
 * {{confirm-share-preprint
 *  isOpen=showModalSharePreprint
 *  shareButtonDisabled=shareButtonDisabled
 *  savePreprint=(action 'savePreprint')
 *}}
 * ```
 * @class confirm-share-preprint
 * @namespace component
 */
export default Ember.Component.extend(Analytics, {
    isOpen: false,
    actions: {
        close() {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: 'Preprints - Submit - Cancel Share Preprint'
                });
            this.set('isOpen', false);
        }
    }
});
