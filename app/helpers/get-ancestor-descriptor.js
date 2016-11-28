import Ember from 'ember';

function fetchIdFromRelationshipLink(node, relationship) {
    // Private node ids can be accessed under initializedRelationships.
    if (node) {
        let relationships = node._internalModel._relationships.initializedRelationships[relationship];
        if (relationships && relationships.link) {
            return relationships.link.split('nodes')[1].replace(/\//g, '');
        }
    }
   return undefined;
}

function fetchTitle(node, relationship) {
    // Fetches parent or root title.  If null, marks 'Private'.
    let title = node.get(`${relationship}.title`);
    if (typeof title === 'undefined') {
        title = 'Private';
    }
    return title;

}

export function getAncestorDescriptor(params/*, hash*/) {
    // Formats titles similar to the way they're displayed in the dashboard.  For example, Root Name / ... / Parent Name / Node Name.
    let node = params[0];
    let nodeId = node.get('id');
    let rootId = node.get('root.id');
    let parentId = node.get('parent.id')

    if (typeof rootId === 'undefined') rootId = fetchIdFromRelationshipLink(node, 'root');
    if (typeof parentId === 'undefined') parentId = fetchIdFromRelationshipLink(node, 'parent');

    let parentTitle = fetchTitle(node, 'parent');
    let rootTitle = fetchTitle(node, 'root');

    let parent = node.get('parent').content;
    let parentParentId = fetchIdFromRelationshipLink(parent, 'parent');

    let rootDescriptor;
    if (rootId === nodeId) { // One level
        rootDescriptor = '';
    } else if (rootId === parentId) { // Two levels
        rootDescriptor = parentTitle + ' / '
    } else if (rootId === parentParentId) { // Three levels
        rootDescriptor = rootTitle + ' / ' + parentTitle + ' / '
    } else { // Four + levels
        rootDescriptor = rootTitle + ' / ... / ' + parentTitle + ' / '
    }

    return rootDescriptor;
}

export default Ember.Helper.helper(getAncestorDescriptor);
