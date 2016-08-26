import Ember from 'ember';

import { getKeenFileCounts } from '../utils/analytics';

export default Ember.Route.extend({
    model(params) {
        return this.store.findRecord('preprint', params.preprint_id);
    },
    setupController(controller, model) {
        this._super(...arguments);

        model.get('primaryFile').then((file) => {
            let key = model.get('keenio_read_key');
            let path = file.path;
            return getKeenFileCounts(path, key);
        }).then((counts) => controller.set('keenCounts', counts));
    },

    actions: {
        error: function() {
            this.transitionTo('/page-not-found');
        }
    }
});
