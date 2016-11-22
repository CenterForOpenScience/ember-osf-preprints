import Ember from 'ember';
import config from 'ember-get-config';
import loadAll from 'ember-osf/utils/load-relationship';
import permissions from 'ember-osf/const/permissions';

// The submit controller/template is used to handle both Add and Edit modes for a preprint.  Contains
// the setupController items necessary for both Add and Edit Modes.
export default Ember.Mixin.create({
    panelActions: Ember.inject.service('panelActions'),
    setupSubmitController(controller, model) {
        //setupController method that will be run for both Add and Edit modes for submit form.
        if (controller.get('model.isLoaded'))
            controller.clearFields();
        controller.set('editMode', this.get('editMode'));
        var currentProvider = this.get('theme.id') || config.PREPRINTS.provider;

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
                embed: 'preprints'
            }).then(() => {
                // Can only have one published preprint per provider per node.
                const node = this.get('node');
                let noProviderConflict = userNodes.filter((item) => {
                    var eligible = true;
                    item.get('preprints').toArray().forEach((preprint) => {
                        var isPublished = preprint.get('isPublished');
                        // Extracting preprint provider from provider url
                        var preprintProvider = this.getPreprintProvider(preprint);
                        if (isPublished && currentProvider === preprintProvider) eligible = false;
                        if (node && item.id === node.id) { // If editMode, determine if fileLocked should be true (there are other published preprints on the node)
                            if (isPublished && currentProvider !== preprintProvider) controller.set('fileLocked', true);
                        }
                    });
                    return eligible;
                });
                // TODO Hack: API does not support filtering current_user_permissions in the way we desire, so filter
                // on front end for now until filtering support can be added to backend
                let onlyAdminNodes = noProviderConflict.filter((item) => item.get('currentUserPermissions').includes(permissions.ADMIN));
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
    },
    getPreprintProvider(preprint) {
        return preprint.get('links.relationships.provider.links.related.href').split('preprint_providers/')[1].replace('/', '');
    }
});
