import Ember from 'ember';

import CasAuthenticatedRouteMixin from 'ember-osf/mixins/cas-authenticated-route';
import permissions from 'ember-osf/const/permissions';
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

        this.get('currentUser').load()
            .then((user) => {
                controller.set('user', user);
                return user;
            }).then((user) => loadAll(user, 'nodes', userNodes, {
                'filter[preprint]': false
            }).then(() => {
                // TODO Hack: API does not support filtering current_user_permissions in the way we desire, so filter
                // on front end for now until filtering support can be added to backend
                let onlyAdminNodes = userNodes.filter((item) => item.get('currentUserPermissions').indexOf(permissions.ADMIN) !== -1);
                controller.set('userNodes', onlyAdminNodes);
            }));

        return this._super(...arguments);
    }
});
