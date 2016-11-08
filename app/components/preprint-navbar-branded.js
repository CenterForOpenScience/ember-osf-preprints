import Ember from 'ember';
import OSFAgnosticAuthControllerMixin from 'ember-osf/mixins/osf-agnostic-auth-controller';
import Analytics from '../mixins/analytics';

export default Ember.Component.extend(OSFAgnosticAuthControllerMixin, Analytics, {
    theme: Ember.inject.service(),
});
