import Ember from 'ember';

import { getKeenFileCounts } from '../utils/analytics';

export default Ember.Route.extend({
    model(params) {
        return this.store.findRecord('preprint', params.preprint_id);
    },
    setupController(controller, model) {
        this._super(...arguments);

        model.get('primaryFile').then((file) => {
            let key = model.get('keenioReadKey');
            let path = file.get('path');
            return getKeenFileCounts(path, key);
        }).then((counts) => {
            // If no data provided, don't feed counts to template- JS treats empty object as truthy
            controller.set('keenCounts', Ember.$.isEmptyObject(counts) ? null : counts);
        });
    },

    actions: {
        error: function() {
            this.transitionTo('/page-not-found');
        }
    }
});
