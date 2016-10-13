import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';
import AnalyticsMixin from '../mixins/analytics-mixin';

export default Ember.Route.extend(AnalyticsMixin, ResetScrollMixin, {
    model(params) {
        return this.store.findRecord('preprint', params.preprint_id);
    },
    afterModel(preprint) {
        return preprint.get('node').then(node => this.set('node', node));
    },
    setupController(controller, model) {
        controller.set('activeFile', model.get('primaryFile'));
        controller.set('node', this.get('node'));
        Ember.run.scheduleOnce('afterRender', this, function() {
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, [Ember.$('.abstract')[0], Ember.$('#preprintTitle')[0]]]);  // jshint ignore:line
        });
        return this._super(...arguments);
    },
    actions: {
        error(error, transition) {
            window.history.replaceState({}, 'preprints', 'preprints/' + transition.params.content.preprint_id);
            this.intermediateTransitionTo('page-not-found');
        }
    }
});
