import Ember from 'ember';

import CasAuthenticatedRouteMixin from 'ember-osf/mixins/cas-authenticated-route';
import loadAll from 'ember-osf/utils/load-relationship';

export default Ember.Route.extend(CasAuthenticatedRouteMixin, {
    currentUser: Ember.inject.service('currentUser'),
    model() {
        // Store the empty preprint to be created on the model hook for page. Node will be fetched
        //  internally during submission process.
        return this.store.createRecord('preprint');
    },

    setupController(controller) {
        // Fetch values required to operate the page: user and userNodes
        let userNodes = Ember.A();
        controller.set('userNodes', userNodes);

        this.get('currentUser').load()
            .then((user) => {
                controller.set('user', user);
                return user;
            }).then((user) => loadAll(user, 'nodes', userNodes));

        return this._super(...arguments);
    }
});
