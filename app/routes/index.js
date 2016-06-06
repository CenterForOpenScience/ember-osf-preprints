import Ember from 'ember';
import OsfLoginRouteMixin from 'ember-osf/mixins/osf-login-route';

export default Ember.Route.extend({OsfLoginRouteMixin
});

export default Ember.Route.extend({
    model() {
        return this.store.findAll('preprint');
    },
    actions: {
        goToSubject(url) {
            window.document.location = url;
        }
    }
});
