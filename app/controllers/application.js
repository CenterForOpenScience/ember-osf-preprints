import Ember from 'ember';
import OSFAgnosticAuthControllerMixin from 'ember-osf/mixins/osf-agnostic-auth-controller';

import config from 'ember-get-config';

export default Ember.Controller.extend(OSFAgnosticAuthControllerMixin, {
    toast: Ember.inject.service(),
    theme: Ember.inject.service(),

    signupUrl: `${config.OSF.url}register?` + Ember.$.param({campaign: config.PREPRINTS.campaign}),
});
