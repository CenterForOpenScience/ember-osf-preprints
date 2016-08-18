import Ember from 'ember';
import OSFAgnosticAuthControllerMixin from 'ember-osf/mixins/osf-agnostic-auth-controller';

export default Ember.Controller.extend(OSFAgnosticAuthControllerMixin, {
    toast: Ember.inject.service(),
    actions: {
        loginFail(/* err */) {
            // TODO: Possibly remove toast from application route? Consider error messaging behavior in the future.
            this.get('toast').error('Login failed');
        }
    }
});
