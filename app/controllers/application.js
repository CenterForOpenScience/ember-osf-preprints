import Ember from 'ember';
import OSFAgnosticAuthControllerMixin from 'ember-osf/mixins/osf-agnostic-auth-controller';

export default Ember.Controller.extend(OSFAgnosticAuthControllerMixin, {
    toast: Ember.inject.service(),
});
