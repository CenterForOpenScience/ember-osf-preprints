import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';
import Analytics from '../mixins/analytics';

export default Ember.Route.extend(Analytics, ResetScrollMixin, {
    init() {
        this._super(...arguments);
        if (window.location.pathname.split('/')[2] && window.location.pathname.split('/')[2].length == 5) {
            window.location = window.location.origin + '/' + window.location.pathname.split('/')[2] + '/';
        }
    }
});
