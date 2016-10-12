import Ember from 'ember';

export default Ember.Component.extend({
    isOpen: false,
    shareButtonDisabled: false,
    actions: {
        close() {
            this.set('isOpen', false);
        },
        savePreprint() {
            this.set('shareButtonDisabled', true);
            this.attrs.savePreprint().catch(() => {
                    this.toast.error('Could not save preprint; please try again later');
                    this.set('shareButtonDisabled', false);
                });
        }
    }
});
