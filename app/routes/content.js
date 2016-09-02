import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';

import { getKeenFileCounts } from '../utils/analytics';

export default Ember.Route.extend(ResetScrollMixin, {
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
        return this._super(...arguments);
    },
    actions: {
        error: function() {
            this.transitionTo('/page-not-found');
        }
    }
});
