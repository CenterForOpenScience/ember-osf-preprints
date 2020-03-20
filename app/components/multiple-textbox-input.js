import Component from '@ember/component';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import Analytics from 'ember-osf/mixins/analytics';

export default Component.extend(Analytics, {
    textFields: null, // passed in array of text fields on invocation, default to null
    textFieldsLastIndex: computed('textFields.[]', function() {
        return this.get('textFields').length - 1;
    }),

    actions: {
        addTextField() {
            let fields = this.get('textFields');
            if (!fields) {
                fields = [$('.ember-text-field')[0].value];
            }
            fields.pushObject('');
            this.set('textFields', fields);
        },
        removeTextField(index) {
            const fields = this.get('textFields');
            fields.removeAt(index);
            this.set('textFields', fields);
        },
    },
    onFieldChange: task(function* (index) {
        yield timeout(200); // debounce
        let fields = this.get('textFields');
        if (!fields) {
            fields = [$('.ember-text-field')[0].value];
        }
        fields[index] = $('.ember-text-field')[index].value;
        this.set('textFields', fields);
    }).restartable(),
});
