import Component from '@ember/component';
import { computed } from '@ember/object';
import Analytics from 'ember-osf/mixins/analytics';

export default Component.extend(Analytics, {
    model: null,
    valuePath: null,
    textFields: null,
    textFieldsLastIndex: computed('textFields.[]', function() {
        return this.get('textFields').length - 1;
    }),

    didReceiveAttrs() {
        const valuesFromModel = this.model.get(this.valuePath);
        if (valuesFromModel) {
            this.set('textFields', valuesFromModel.map((x) => {
                return { value: x };
            }));
            return;
        }
        this.set('textFields', [{ value: '' }]);
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
            this.send('onChange');
        },
        onChange() {
            this.model.set(this.valuePath, this.get('textFields').filter((item) => {
                if (!item.value) {
                    return false;
                }
                return true;
            }).map(x => x.value));
        },
    },
});
