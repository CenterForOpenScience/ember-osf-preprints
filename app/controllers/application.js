import Ember from 'ember';
import OSFCookieLoginControllerMixin from 'ember-osf/mixins/osf-cookie-login-controller';

export default Ember.Controller.extend(OSFCookieLoginControllerMixin, {
    toast: Ember.inject.service(),
    actions: {
        loginFail(/* err */) {
            // TODO: Possibly remove toast from application route? Consider error messaging behavior in the future.
            this.get('toast').error('Login failed');
        }
    }
});
