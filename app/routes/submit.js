import Ember from 'ember';

import CasAuthenticatedRouteMixin from 'ember-osf/mixins/cas-authenticated-route';
import ResetScrollMixin from '../mixins/reset-scroll';
import permissions from 'ember-osf/const/permissions';
import loadAll from 'ember-osf/utils/load-relationship';
import Analytics from '../mixins/analytics';

export default Ember.Route.extend(Analytics, ResetScrollMixin, CasAuthenticatedRouteMixin, {
    currentUser: Ember.inject.service('currentUser'),
    panelActions: Ember.inject.service('panelActions'),
    model(params) {
        // Model is either empty preprint (Add mode) or loaded preprint (Edit mode)
        if (this.get('router.url').indexOf('edit') !== -1) { //EDIT MODE - loads preprint
            this.set('editMode', true);
            return this.store.findRecord('preprint', params.preprint_id);
        } else { // ADD MODE - Store the empty preprint to be created on the model hook for page. Node will be fetched internally during submission process.
            this.set('editMode', false);
            return this.store.createRecord('preprint', {
                subjects: []
            });
        }
    },
    afterModel(preprint) {
        // Loads node associated with preprint if in Edit Mode
        if (this.get('editMode')) {
            return preprint.get('node').then(node => this.set('node', node));
        }
    },
    setupController(controller, model) {
        if (controller.get('model.isLoaded'))
            controller.clearFields();
        controller.set('editMode', this.get('editMode'));

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

        // If editMode, set these initial fields to pre-populate form with preprint/node data.
        if (this.get('editMode')) {
            loadEditModeDefaults(controller, model, this.get('node'));
            this.get('panelActions').close('Upload');
        }

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

// This function helps populate all the preprint fields in Edit mode.
function loadEditModeDefaults(controller, model, node) {
    controller.set('filePickerState', 'existing');
    controller.set('existingState', 'new');
    controller.set('node', node);
    controller.set('nodeTitle', node.get('title'));
    controller.set('nodeLocked', true);
    controller.set('titleValid', true);
    model.get('primaryFile').then((file) => {
        controller.set('selectedFile', file);
    });
};
