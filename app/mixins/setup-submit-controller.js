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

        this.get('store').query('preprint-provider', { 'filter[allow_submissions]': true }).then(this._setProviders.bind(this));

        this.get('theme.provider').then(this._getAvailableLicenses.bind(this));

        this.get('currentUser').load().then(this._setCurrentUser.bind(this));

        // If editMode, these initial fields are set to pre-populate form with preprint/node data.
        if (this.get('editMode')) {
            this.loadEditModeDefaults(controller, model);
        }
    },
    // This function helps prepopulate all the preprint fields in Edit mode.
    loadEditModeDefaults(controller, model) {
        controller.set('filePickerState', 'version'); // In edit mode, can only upload new version
        controller.set('model', model);
        controller.set('title', model.get('title'));
        controller.set('preprintLocked', true);
        controller.set('titleValid', true);
        model.get('primaryFile').then(this._setSelectedFile.bind(this));
        model.get('node')
            .then(this._setSupplementalProject.bind(this))
            .catch(this._supplementalProjectPermissionDenied.bind(this));
        this.get('panelActions').close('Upload');
        this.get('panelActions').open('Submit');
    },

    _setProviders(providers) {
        const controller = this.get('controller');
        controller.set('providers', providers);
    },

    _setSupplementalProject(node) {
        // If supplemental project exists, set the node and supplementalProjectTitle
        // to the supplementalProject's values
        const controller = this.get('controller');
        controller.set('node', node);
        controller.set('supplementalProjectTitle', node ? node.get('title') : '');
        if (node && node.get('id')) {
            controller.set('supplementalPickerState', 'edit');
        }
    },

    _supplementalProjectPermissionDenied(error) {
        // Permissions on the node and preprint are separate.
        // The supplemental project may have been made private or deleted.
        const controller = this.get('controller');
        controller.set('node', null);
        // If 403 error received, put placeholder title, to tell the user that something is there.
        if (error.errors[0].detail === 'You do not have permission to perform this action.') {
            controller.set('supplementalProjectTitle', '<Private Supplemental Project>');
        }
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
