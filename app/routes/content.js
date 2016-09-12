import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';
import AnalyticsMixin from '../mixins/analytics-mixin';
import { getKeenFileCounts } from '../utils/analytics';

export default Ember.Route.extend(AnalyticsMixin, ResetScrollMixin, {
    model(params) {
        return this.store.findRecord('preprint', params.preprint_id);
    },
    setupController(controller, model) {
        model.get('primaryFile').then((file) => {
            let key = model.get('analyticsReadKey');
            let path = file.get('path');
            return getKeenFileCounts(path, key);
        }).then((counts) => {
            // If no data provided, don't feed counts to template- JS treats empty object as truthy
            controller.set('keenCounts', Ember.$.isEmptyObject(counts) ? null : counts);
        });

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
