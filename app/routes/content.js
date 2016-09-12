import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';
import AnalyticsMixin from '../mixins/analytics-mixin';

export default Ember.Route.extend(AnalyticsMixin, ResetScrollMixin, {
    model(params) {
        return this.store.findRecord('preprint', params.preprint_id);
    },
    setupController(controller, model) {
        controller.set('activeFile', model.get('primaryFile'));
        Ember.run.scheduleOnce('afterRender', this, function() {
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, [Ember.$('.abstract')[0], Ember.$('#preprintTitle')[0]]]);  // jshint ignore:line
        });
        return this._super(...arguments);
    },
    actions: {
        error: function() {
            this.transitionTo('/page-not-found');
        }
    }
});
