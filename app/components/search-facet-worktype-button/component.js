import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
    selected: computed('selectedTypes.[]', function() {
        const selectedTypes = this.get('selectedTypes.value') ? this.get('selectedTypes.value') : this.get('selectedTypes');
        return selectedTypes.includes(this.get('type'));
    }),

    label: computed('type', function() {
        if (this.get('type') === 'creative work') {
            return 'Not Categorized';
        }
        // title case work types: 'creative work' --> 'Creative Work'
        return this.get('type').replace(/\w\S*/g, function(str) { return str.capitalize(); });
    }),

    actions: {
        click() {
            this.$().blur();
            this.get('onClick')(this.get('type'));
        },

        toggleBody() {
            this.get('toggleCollapse')();
        },
    },
});
