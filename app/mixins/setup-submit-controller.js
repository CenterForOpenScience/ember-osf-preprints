import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';

/**
 * @module ember-preprints
 * @submodule mixins
 */

/**
 * The submit controller/template is used to handle both Add and
 * Edit modes for a preprint.  Contains the setupController items
 * necessary for both Add and Edit Modes.
 *
 * @class SetupSubmitControllerMixin
 */

export default Mixin.create({
    theme: service(),
    panelActions: service('panelActions'),

    controller: null,

    setupSubmitController(controller, model) {
        // setupController method that will be run for both Add and Edit modes for submit form.
        this.set('controller', controller);

        if (controller.get('model.isLoaded')) { controller.clearFields(); }
        controller.set('editMode', this.get('editMode'));

        this.get('store').findAll('preprint-provider').then(this._setProviders.bind(this));

        this.get('theme.provider').then(this._getAvailableLicenses.bind(this));

        this.get('currentUser').load().then(this._setCurrentUser.bind(this));

        // If editMode, these initial fields are set to pre-populate form with preprint/node data.
        if (this.get('editMode')) {
            this.loadEditModeDefaults(controller, model, model.get('node'));
        }
    },
    // This function helps prepopulate all the preprint fields in Edit mode.
    loadEditModeDefaults(controller, model, node) {
        controller.set('filePickerState', 'existing'); // In edit mode, dealing with existing project
        controller.set('existingState', 'new'); // In edit mode, only option to change file is to upload a NEW file
        controller.set('node', node);
        controller.set('title', model.get('title'));
        controller.set('supplementalProjectTitle', node.get('title'))
        controller.set('preprintLocked', true);
        controller.set('titleValid', true);
        model.get('primaryFile').then(this._setSelectedFile.bind(this));
        this.get('panelActions').close('Upload');
        this.get('panelActions').open('Submit');
    },

    _setProviders(providers) {
        const controller = this.get('controller');
        controller.set('providers', providers);
    },

    _getAvailableLicenses(provider) {
        provider.queryHasMany('licensesAcceptable', { 'page[size]': 20 })
            .then(this._setAvailableLicenses.bind(this));
    },

    _setAvailableLicenses(licenses) {
        const controller = this.get('controller');
        controller.set('availableLicenses', licenses);
    },

    _setCurrentUser(user) {
        const controller = this.get('controller');
        controller.set('user', user);
        return user;
    },

    _setSelectedFile(file) {
        const controller = this.get('controller');
        controller.set('selectedFile', file);
    },
});
