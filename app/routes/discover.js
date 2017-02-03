import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';
import Analytics from '../mixins/analytics';

export default Ember.Route.extend(Analytics, ResetScrollMixin, {
    queryParams: {
        queryString: {
            replace: true
        }
    },
    model() {
        return this
            .get('store')
            .findAll('preprint-provider', { reload: true })
            .then(result => result.filter(item => item.id !== 'osf'));
    },
    actions: {
        willTransition() {
            let controller = this.controllerFor('discover');
            controller._clearFilters();
        }
    }
});
