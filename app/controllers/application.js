import Ember from 'ember';
import OSFCookieLoginControllerMixin from 'ember-osf/mixins/osf-cookie-login-controller';
import { getAuthUrl } from 'ember-osf/utils/auth';

//export default Ember.Controller.extend(OSFCookieLoginControllerMixin, {
export default Ember.Controller.extend({
    toast: Ember.inject.service(),
    actions: {
        loginSuccess() {
            this.refresh();
        },
        loginFail(/* err */) {
            // TODO: Possibly remove toast from application route? Consider error messaging behavior in the future.
            this.get('toast').error('Login failed');
        }
    }
});
