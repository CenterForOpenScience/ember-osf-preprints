import Ember from 'ember';

import ResetScrollMixin from '../mixins/reset-scroll';
import Analytics from '../mixins/analytics';

export default Ember.Route.extend(Analytics, ResetScrollMixin, {
    model() {
        return this.store.query('taxonomy', { filter: { parents: 'null' }, page: { size: 20 } });
    },
    setupController(controller, model) {
        this._super(controller, model);
        controller.set('currentDate', new Date());
    },
    actions: {
        search(q) {
            this.transitionTo('discover', { queryParams: { queryString: q } });
        }
    }
});
