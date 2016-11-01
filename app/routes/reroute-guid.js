import Ember from 'ember';

export default Ember.Route.extend({
    init() {
        this._super(...arguments);
        if (window.location.pathname.split('/')[2] && window.location.pathname.split('/')[2].length == 5) {
            window.location = window.location.origin + '/' + window.location.pathname.split('/')[2] + '/';
        }
    }
});
