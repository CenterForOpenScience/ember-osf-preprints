import Ember from 'ember';
import OSFAgnosticAuthControllerMixin from 'ember-osf/mixins/osf-agnostic-auth-controller';

import config from '../config/environment';

export default Ember.Controller.extend(OSFAgnosticAuthControllerMixin, {
    toast: Ember.inject.service(),
    store: Ember.inject.service(),

    init() {
        let provider_url = window.location.host;
        //FOR TESTING
        if (provider_url === '127.0.0.1:5000') {
            provider_url = 'http://engrxiv.org';
        }
        ///
        this.get('store').query('preprint-provider', {filter: {external_url: provider_url}}).then(function(results) {
            if (results.get('length') === 1) {
                results.map(each => config.APP.provider = each.id);
            }
        });
    },

    signupUrl: `${config.OSF.url}login?` + Ember.$.param({campaign: config.PREPRINTS.campaign}),
});
