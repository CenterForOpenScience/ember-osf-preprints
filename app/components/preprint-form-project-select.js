import Ember from 'ember';
import Permissions from 'ember-osf/const/permissions';

export default Ember.Component.extend({
    userNodes: Ember.A(),
    selectedNode: null,
    isAdmin: Ember.computed('selectedNode', function() {
        return this.get('selectedNode.currentUserPermissions').indexOf(Permissions.ADMIN) !== -1;
    }),
    getFiles: Ember.observer('selectedNode', function() {
        this.get('selectedNode').get('files').then(files =>
            this.set('osfFiles', files.findBy('name', 'osfstorage'))
        );
    }),
    osfFiles: null
});
