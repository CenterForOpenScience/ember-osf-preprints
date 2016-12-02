import Ember from 'ember';
import OSFAgnosticAuthControllerMixin from 'ember-osf/mixins/osf-agnostic-auth-controller';
import Analytics from '../mixins/analytics';

export default Ember.Component.extend(OSFAgnosticAuthControllerMixin, Analytics, {
    session: Ember.inject.service(),
    theme: Ember.inject.service(),
    tagName: 'nav',
    classNames: ['navbar', 'branded-navbar', 'preprint-navbar']
});
