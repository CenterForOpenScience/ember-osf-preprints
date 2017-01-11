import Ember from 'ember';
import Analytics from '../mixins/analytics';

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
