import Ember from 'ember';

// Formats titles similar to the way they're displayed in the dashboard.  For example, Root Name / ... / Parent Name / Node Name.
export function getAncestorDescriptor(params/*, hash*/) {
    // TODO consolidate this function
    var node = params[0];
    var nodeId = node.get('id');
    var rootId = node.get('root.id');
    var parentId = node.get('parent.id');
    var rootDescriptor;

    if (typeof rootId !== 'undefined') {
        if (typeof parentId !== 'undefined') {
            if (parentId === rootId) {
                rootDescriptor = node.get('root.title') + ' / ';
            } else {
                if (node.get('parent.parent.id') === rootId) {
                    rootDescriptor = node.get('root.title') + ' / ' + node.get('parent.title') + ' / ';
                } else {
                    rootDescriptor = node.get('root.title') + ' /.../ ' + node.get('parent.title') + ' / ';
                }
            }
        } else {
            if (rootId === nodeId) {
                rootDescriptor = '';
            } else {
                rootDescriptor = node.get('root.title') + '/.../ ';
            }
        }
    } else {
        if (typeof parentId !== 'undefined') {
            if (node.get('parent.parent.id')) {
                rootDescriptor = 'Private / ... / ' + node.get('parent.title') + ' / ';

            } else {
                rootDescriptor = 'Private / ' + node.get('parent.title') + ' / ';
            }
        } else {
            rootDescriptor = 'Private / ';
        }
    }

    return rootDescriptor + node.get('title');
}

export default Ember.Helper.helper(getAncestorDescriptor);
