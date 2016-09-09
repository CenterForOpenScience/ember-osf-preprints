import Ember from 'ember';

// Formats titles similar to the way they're displayed in the dashboard.  For example, Root Name / ... / Parent Name / Node Name.
export function getAncestorDescriptor(params/*, hash*/) {
    // TODO Cannot distinguish between whether a node or root is private, or if there is no parent.  Both
    // scenarios returns content:null.  Need changes ember-osf side.
    // Also, if root or parent is private, get a 403 in console.
    // TODO consolidate this function
    var node = params[0];
    var nodeId = node.get('id');
    var root = node.get('root');
    var rootId = root.get('id');
    var parent = node.get('parent');
    var parentId = parent.get('id');
    var rootDescriptor;
    var parentDescriptor;

    if (rootId === undefined) {
        rootDescriptor = 'Private / ';
    } else if (nodeId === rootId) {
        rootDescriptor = '';
    } else {
        rootDescriptor = root.get('title').replace('.', '') + ' / ';
    }

    if (parentId === undefined) {
        parentDescriptor = 'Private / ';
    } else if (nodeId === parentId) {
        parentDescriptor = '';
    } else {
        parentDescriptor = parent.get('title').replace('.', '') + ' / ';
    }

    if (rootId === parentId) {
        parentDescriptor = '';
    }

    if (parentId && parent.get('parent').get('id') !== rootId) {
        rootDescriptor += '... / ';
    }

    return rootDescriptor + parentDescriptor + node.get('title');

}

export default Ember.Helper.helper(getAncestorDescriptor);
