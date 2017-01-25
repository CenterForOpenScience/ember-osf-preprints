// This component is derived from ember-cp-validations. See https://github.com/offirgolan/ember-cp-validations for more information
import Ember from 'ember';
const {
    isEmpty,
    computed,
    defineProperty,
} = Ember;

export default Ember.Component.extend({
    classNames: ['validated-input'],
    classNameBindings: ['showErrorClass:has-error', 'isValid:has-success'],
    model: null,
    value: null,
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

    isValid: computed.and('hasContent', 'validation.isValid', 'notValidating'),
    isInvalid: computed.oneWay('validation.isInvalid'),

    showWarningMessage: computed('validation.isDirty', 'validation.warnings.[]', 'isValid', 'didValidate', function() {
        return (this.get('validation.isDirty') || this.get('didValidate')) && this.get('isValid') && !isEmpty(this.get('validation.warnings'));
    }),

    keyPress(e) {
        if (e.keyCode === 13 && !this.get('large')) {
            e.preventDefault();
            this.send('pressSubmit');
        }
    },
    actions: {
        pressSubmit() {
            this.sendAction('pressSubmit');
        }
    }
});
