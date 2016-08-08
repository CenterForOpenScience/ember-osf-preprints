import Ember from 'ember';

export default Ember.Component.extend({
    userNodes: Ember.A(),
    selectedNode: null,
    isAdmin: Ember.computed('selectedNode', function() {
        return ~this.get('selectedNode.currentUserPermissions').indexOf('admin');
    })
});
