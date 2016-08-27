import Ember from 'ember';
import resetScrollMixin from '../mixins/reset-scroll';

export default Ember.Route.extend(resetScrollMixin, {
    model(params) {
        return this.store.findRecord('preprint', params.preprint_id);
    },
    actions: {
        error: function() {
            this.transitionTo('/page-not-found');
        }
    }
});
