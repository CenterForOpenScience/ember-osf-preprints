import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';

export default Ember.Route.extend(ResetScrollMixin, {
    model(params) {
        return this.store.findRecord('preprint', params.preprint_id);
    },
    setupController(controller, model) {
        controller.set('activeFile', model.get('primaryFile'));
        return this._super(...arguments);
    },
    actions: {
        error: function() {
            this.intermediateTransitionTo('/page-not-found');
        }
    }
});
