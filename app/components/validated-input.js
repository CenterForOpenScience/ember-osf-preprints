import Ember from 'ember';
const {
    isEmpty,
    computed,
    defineProperty,
} = Ember;

import Validations from '../validators/preprint-form-validator';

// Template largely taken from the ember-cp-validations example. Except the isValid and isInvalid are changed from validation.isValid
// to validations.isValid (with an extra s on the end) -- otherwise it doesn't work
export default Ember.Component.extend(Validations, {
    classNames: ['validated-input'],
    classNameBindings: ['showErrorClass:has-error', 'isValid:has-success'],
    model: null,
    type: 'text',
    valuePath: '',
    placeholder: '',
    validation: null,
    isTyping: false,

    init() {
        this._super(...arguments);
        var valuePath = this.get('valuePath');
        defineProperty(this, 'validation', computed.oneWay(`model.validations.attrs.${valuePath}`));
        defineProperty(this, 'value', computed.alias(`model.${valuePath}`));
    },

    showErrorMessage: computed('validation.isDirty', 'isInvalid', 'didValidate', function() {
        return (this.get('validation.isDirty') || this.get('didValidate')) && this.get('isInvalid');
    }),

    notValidating: computed.not('validation.isValidating'),
    didValidate: computed.oneWay('targetObject.didValidate'),
    hasContent: computed.notEmpty('value'),

    // I am not sure why, but I had to use validations here and not validation.
    isValid: computed.and('validations.isValid'),
    isInvalid: computed.and('validations.isInvalid'),

    showWarningMessage: computed('validation.isDirty', 'validation.warnings.[]', 'isValid', 'didValidate', function() {
        return (this.get('validation.isDirty') || this.get('didValidate')) && this.get('isValid') && !isEmpty(this.get('validation.warnings'));
    })
});
