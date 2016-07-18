import Ember from 'ember';
import OsfLoginControllerMixin from 'ember-osf/mixins/osf-token-login-controller';
import { getAuthUrl } from 'ember-osf/utils/auth';

export default Ember.Controller.extend(OsfLoginControllerMixin, {
    toast: Ember.inject.service(),
    authUrl: getAuthUrl(),
    actions: {
        loginSuccess() {
            this.refresh();
        },
        loginFail(/* err */) {
            this.get('toast').error('Login failed');
        }
    }
});
