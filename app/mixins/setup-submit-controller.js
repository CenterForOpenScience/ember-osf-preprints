import Ember from 'ember';
import loadAll from 'ember-osf/utils/load-relationship';
import permissions from 'ember-osf/const/permissions';

// The submit controller/template is used to handle both Add and Edit modes for a preprint.  Contains
// the setupController items necessary for both Add and Edit Modes.
export default Ember.Mixin.create({
    theme: Ember.inject.service(),
    panelActions: Ember.inject.service('panelActions'),

    setupSubmitController(controller, model) {
        //setupController method that will be run for both Add and Edit modes for submit form.
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
        this.get('theme.provider').then(provider => {
            provider.query('licensesAcceptable', {'page[size]': 20}).then(licenses => {
                controller.set('availableLicenses', licenses)
            })
        });
        this.get('currentUser').load()
            .then((user) => {
                controller.set('user', user);
                return user;
            }).then((user) => loadAll(user, 'nodes', userNodes, {
                'filter[preprint]': false
            }).then(() => {
                // TODO Hack: API does not support filtering current_user_permissions in the way we desire, so filter
                // on front end for now until filtering support can be added to backend
                let onlyAdminNodes = userNodes.filter((item) => item.get('currentUserPermissions').includes(permissions.ADMIN));
                controller.set('userNodes', onlyAdminNodes);
                controller.set('userNodesLoaded', true);
            }));

        // If editMode, these initial fields are set to pre-populate form with preprint/node data.
        if (this.get('editMode')) {
            this.loadEditModeDefaults(controller, model, this.get('node'));
        }

    },
    // This function helps prepopulate all the preprint fields in Edit mode.
    loadEditModeDefaults(controller, model, node) {
        controller.set('filePickerState', 'existing'); // In edit mode, dealing with existing project
        controller.set('existingState', 'new'); // In edit mode, only option to change file is to upload a NEW file
        controller.set('node', node);
        controller.set('nodeTitle', node.get('title'));
        controller.set('nodeLocked', true);
        controller.set('titleValid', true);
        model.get('primaryFile').then((file) => {
            controller.set('selectedFile', file);
        });
        this.get('panelActions').close('Upload');
        this.get('panelActions').open('Submit');
    }
});
