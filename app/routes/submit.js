import Ember from 'ember';

import CasAuthenticatedRouteMixin from 'ember-osf/mixins/cas-authenticated-route';
import ResetScrollMixin from '../mixins/reset-scroll';
import permissions from 'ember-osf/const/permissions';
import loadAll from 'ember-osf/utils/load-relationship';
import AnalyticsMixin from '../mixins/analytics-mixin';

export default Ember.Route.extend(AnalyticsMixin, ResetScrollMixin, CasAuthenticatedRouteMixin, {
    currentUser: Ember.inject.service('currentUser'),
    model() {
        // Store the empty preprint to be created on the model hook for page. Node will be fetched
        //  internally during submission process.
        return this.store.createRecord('preprint', {
            subjects: []
        });
    },
    setupController(controller) {
        if (controller.get('model.isLoaded'))
            controller.clearFields();

        // Fetch values required to operate the page: user and userNodes
        let userNodes = Ember.A();

        this.get('store').findAll('preprint-provider')
            .then((providers) => {
                controller.set('providers', providers);
            }
        );

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
                controller.set('userNodesLoaded', true);
            }));
        return this._super(...arguments);
    },
    actions: {
        willTransition: function(transition) {
            // Displays confirmation message if user attempts to navigate away from Add Preprint process with unsaved changes
            var controller = this.get('controller');
            var hasFile = controller.get('file') !== null || controller.get('selectedFile') !== null;

            if (hasFile && !controller.get('savingPreprint') && !confirm('Are you sure you want to abandon this preprint?')) {
                transition.abort();
            }
        }
    }
});
