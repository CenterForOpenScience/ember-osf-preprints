import Ember from 'ember';
import DS from 'ember-data';

import Permissions from 'ember-osf/const/permissions';

export default Ember.Component.extend({
    userNodes: Ember.A(),
    selectedNode: null,
    isAdmin: Ember.computed('selectedNode', function() {
        return this.get('selectedNode.currentUserPermissions').indexOf(Permissions.ADMIN) !== -1;
    }),
    osfProviderLoaded: false,
    osfStorageProvider: null,

    osfProvider: Ember.computed('selectedNode', function() {
        // TODO: Support a tree widget, eg get filebrowser working
        return DS.PromiseObject.create({
            promise: this.get('selectedNode.files').then(files => files.findBy('name', 'osfstorage'))
        });
    }),
    actions: {
        // Sets selectedNode, then loads node's osfstorage provider. Once osfstorage is loaded,
        // file-browser component can be loaded.
        nodeSelected(node) {
            this.set('selectedNode', node);
            this.set('osfProviderLoaded', false);
            this.get('selectedNode.files').then((files) => {
                this.set('osfStorageProvider', files.findBy('name', 'osfstorage'));
                this.set('osfProviderLoaded', true);
            });
        }
    },

    /**
     * Whether to show the file selection dropdown box
     * @property {boolean} fileSelect
     */
    fileSelect: false,
});
