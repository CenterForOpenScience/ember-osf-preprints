import Ember from 'ember';

import CasAuthenticatedRouteMixin from 'ember-osf/mixins/cas-authenticated-route';
import ResetScrollMixin from '../mixins/reset-scroll';

export default Ember.Route.extend(ResetScrollMixin, CasAuthenticatedRouteMixin, {
    currentUser: Ember.inject.service('currentUser'),
    model() {
        // Store the empty preprint to be created on the model hook for page. Node will be fetched
        //  internally during submission process.
        return this.store.createRecord('preprint', {
            subjects: []
        });
    },
    setupController(controller) {
        // Fetch values required to operate the page: user and userNodes
        this.get('currentUser').load()
            .then((user) => {
                controller.set('user', user);
                return user;
            }
       );
        return this._super(...arguments);
    },
    actions: {
        willTransition: function(transition) {
            var controller = this.get('controller');

            if (controller.get('hasFile') && !controller.get('savingPreprint') && !confirm('Are you sure you want to abandon this preprint?')) {
                transition.abort();
            }
        }
    }
});
