import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

import loadAll from 'ember-osf/utils/load-relationship';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
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
            }).then((user) => {
                return loadAll(user, 'nodes', userNodes);
            });

        let contributors = Ember.A();
        controller.set('contributors', contributors);
        // FIXME: This shouldn't be in setupController- we don't know the node yet until it is selected
        // var aNode;
        // loadAll(aNode, 'contributors', contributors).then(()=>
        //     controller.set('contributors', contributors));

        return this._super(...arguments);
    }
});
