import Ember from 'ember';

// Formats titles similar to the way they're displayed in the dashboard.  For example, Root Name / ... / Parent Name / Node Name.
export function getAncestorDescriptor(params/*, hash*/) {
    // TODO consolidate this function
    var node = params[0];
    var nodeId = node.get('id');
    var root = node.get('root');
    var rootId = root.get('id');
    var parent = node.get('parent');
    var parentId = parent.get('id');
    var rootDescriptor;

    if (root.isFulfilled) {
        if (parent.isFulfilled) {
            if (parentId === rootId) {
                rootDescriptor = root.get('title') + ' / ';
            } else {
                if (parent.get('parent').get('id') && parent.get('parent').get('id') === rootId) {
                    rootDescriptor = root.get('title') + ' / ' + parent.get('title') + ' / ';
                } else {
                    rootDescriptor = root.get('title') + ' /.../ ' + parent.get('title') + ' / ';
                }
            }
        } else {
            if (rootId === nodeId) {
                rootDescriptor = '';
            } else {
                rootDescriptor = root.get('title') + '/.../ ';
            }
        }
    } else {
        if (parent.isFulfilled) {
            if (parent.get('parent') && parent.get('parent').get('id')) {
                rootDescriptor = 'Private / ... / ' + parent.get('title') + ' / ';

            } else {
                rootDescriptor = 'Private / ' + parent.get('title') + ' / ';
            }
        } else {
            rootDescriptor = 'Private / ';
        }
    }

    return rootDescriptor + node.get('title');
}

export default Ember.Helper.helper(getAncestorDescriptor);
