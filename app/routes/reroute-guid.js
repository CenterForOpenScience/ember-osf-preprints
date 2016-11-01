import Ember from 'ember';

export default Ember.Route.extend({
    beforeModel(transition) {
        let bad_url = transition.params["reroute-guid"] ? transition.params["reroute-guid"].bad_url : null;
        if (bad_url && bad_url.replace(/\/.*$/, '').length === 5) {
            window.location = window.location.origin + '/' + bad_url;
        }
    }
});
