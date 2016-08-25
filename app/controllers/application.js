import Ember from 'ember';
import OSFAgnosticAuthControllerMixin from 'ember-osf/mixins/osf-agnostic-auth-controller';

import config from '../config/environment';

export default Ember.Controller.extend(OSFAgnosticAuthControllerMixin, {
    toast: Ember.inject.service(),

    signupUrl: `${config.OSF.url}login?campaign=${config.PREPRINTS.campaign}`,
});
