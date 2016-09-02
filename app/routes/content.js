import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';

export default Ember.Route.extend(ResetScrollMixin, {
    model(params) {
        return this.store.findRecord('preprint', params.preprint_id);
    },
    setupController(controller, model) {
        controller.set('activeFile', model.get('primaryFile'));
        Ember.run.scheduleOnce('afterRender', this, function() {
            MathJax.Hub.Queue(['Typeset', MathJax.Hub]);  // jshint ignore:line
        });
        return this._super(...arguments);
    },
    actions: {
        error: function() {
            this.transitionTo('/page-not-found');
        }
    }
});
