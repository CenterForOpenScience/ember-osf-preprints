import Component from '@ember/component';
import { computed } from '@ember/object';

/**
 * @module ember-osf-preprints
 * @submodule components
 */

export default Component.extend({
    classNames: ['old-file-browser-item', 'file-browser-item'],

    selected: computed('selectedItems.[]', function() {
        // TODO: This would be better if selectedItems were a hash. Can Ember
        // observe when properties are added to or removed from an object?
        const selectedItems = this.get('selectedItems');
        const index = selectedItems.indexOf(this.get('item'));
        return index > -1;
    }),

    actions: {
        open() {
            this.sendAction('openItem', this.get('item'));
        },
    },

    click() {
        this.sendAction('selectItem', this.get('item'));
    },

    doubleClick() {
        const item = this.get('item');
        if (item.get('canHaveChildren')) {
            this.sendAction('navigateToItem', item);
        } else {
            this.sendAction('openItem', item);
        }
    },
});
