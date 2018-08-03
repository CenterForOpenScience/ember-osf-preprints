import Component from '@ember/component';
import { computed } from '@ember/object';
import { A } from '@ember/array';
import ObjectProxy from '@ember/object/proxy';

import loadAll from 'ember-osf/utils/load-relationship';

/**
 * @module ember-osf-preprints
 * @submodule components
 */

/*
 * Wrapper for file items. Includes state for the item's row.
 *
 */

const FileItem = ObjectProxy.extend({
    isSelected: false,

    _files: null,
    _children: null,
    _filesLoaded: false,
    _childrenLoaded: false,
    childItemsLoaded: computed.and('_filesLoaded', '_childrenLoaded'),

    // TODO (Abram) update childItems when `children` or `files` changes
    // TODO (Abram) catch and display errors
    childItems: computed('_files.[]', '_children.[]', function() {
        const files = this._setupLoadAll('files', '_files', '_filesLoaded');
        const children = this._setupLoadAll('children', '_children', '_childrenLoaded');

        const wrappedItems = A();
        if (files) {
            wrappedItems.addObjects(files.map(wrapItem));
        }
        if (children) {
            wrappedItems.addObjects(children.map(wrapItem));
        }
        return wrappedItems;
    }),

    _setupLoadAll(relationship, destName, loaded) {
        let dest = this.get(destName);
        if (dest === null) {
            const model = this.get('content');
            if (relationship in model) {
                dest = this.set(destName, A());
                loadAll(model, relationship, dest).then(() => {
                    this.set(loaded, true);
                });
            } else {
                this.set(loaded, true);
            }
        }
        return dest;
    },
});

function wrapItem(item) {
    if (item instanceof FileItem) {
        return item;
    }
    return FileItem.create({
        content: item,
    });
}

function unwrapItem(item) {
    if (item instanceof FileItem) {
        return item.get('content');
    }
    return item;
}

/**
 * File browser widget
 *
 * Sample usage:
 * ```handlebars
 * {{old-file-browser
 *  rootItem=item
 *  openFile=(action 'openFile')
 *  openNode=(action 'openNode')}}
 * ```
 * @class old-file-browser
 */
export default Component.extend({
    classNames: ['old-file-browser', 'file-browser'],
    itemHeight: 30,

    breadcrumbs: null,

    atRoot: computed.equal('breadcrumbs.length', 1),
    currentParent: computed.readOnly('breadcrumbs.lastObject'),
    items: computed.readOnly('currentParent.childItems'),
    itemsLoaded: computed.readOnly('currentParent.childItemsLoaded'),
    selectedItems: computed.filterBy('items', 'isSelected', true),

    rootItem: computed('breadcrumbs.[]', {
        get() {
            return this.get('breadcrumbs.firstObject');
        },
        set(_, item) {
            const wrappedItem = wrapItem(item);
            this.set('breadcrumbs', A([wrappedItem]));
        },
    }),

    itemWidth: computed('itemsLoaded', function() {
        return this.$().width();
    }),

    actions: {
        selectItem(item) {
            item.set('isSelected', true);
            if (item.get('isFile') && this.get('selectFile')) {
                this.sendAction('selectFile', unwrapItem(item));
            }
            if (item.get('isNode') && this.get('selectNode')) {
                this.sendAction('selectNode', unwrapItem(item));
            }
        },

        openItem(item) {
            if (item.get('isFile') && this.get('openFile')) {
                this.sendAction('openFile', unwrapItem(item));
            }
            if (item.get('isNode') && this.get('openNode')) {
                this.sendAction('openNode', unwrapItem(item));
            }
            if (item.get('canHaveChildren')) {
                this.send('navigateToItem', item);
            }
        },

        navigateToItem(item) {
            const breadcrumbs = this.get('breadcrumbs');
            const index = breadcrumbs.indexOf(item);
            if (index === -1) {
                // TODO: Valid to assume item is a child of currentParent?
                breadcrumbs.pushObject(item);
            } else {
                const slicedBread = breadcrumbs.slice(0, index + 1);
                this.set('breadcrumbs', A(slicedBread));
            }
        },

        navigateUp() {
            const breadcrumbs = this.get('breadcrumbs');
            if (breadcrumbs.length === 1) {
                return;
            }
            breadcrumbs.popObject();
        },
    },
});
