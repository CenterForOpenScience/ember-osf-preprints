import Component from '@ember/component';
import { computed } from '@ember/object';
import Analytics from 'ember-osf/mixins/analytics';

export default Component.extend(Analytics, {
    legend: 'Text Fields',
    textFields: null, // passed in array of text fields on invocation, default to null
    textFieldsLastIndex: computed('textFields.[]', function() {
        return this.get('textFields').length - 1;
    }),

    didReceiveAttrs() {
        if (!this.textFields) {
            this.set('textFields', [{ value: '' }]);
        }
    },

    actions: {
        addTextField() {
            let fields = this.get('textFields');
            if (!fields) {
                fields = [{ value: '' }];
            }
            fields.pushObject({ value: '' });
            this.set('textFields', fields);
        },
        removeTextField(index) {
            const fields = this.get('textFields');
            fields.removeAt(index);
            this.set('textFields', fields);
        },
    },
});
