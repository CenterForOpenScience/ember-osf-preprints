// Copied from ember-cpi-validations/tests/dummy/app

// BEGIN-SNIPPET validated-input
import Ember from 'ember';

const {
  isEmpty,
  computed,
  defineProperty,
} = Ember;
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Adapted from ember-cpi-validations/tests/dummy/app to make a form field with validation
 *
 * Sample usage:
 * ```handlebars
 * {{validated-input
 *      model=this valuePath='nodeTitle'
 *      placeholder=(t "components.file-uploader.title_placeholder")
 *      value=nodeTitle
 * }}
 * ```
 * @class validated-input
 */
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

    notValidating: computed.not('validation.isValidating'),
    didValidate: computed.oneWay('targetObject.didValidate'),
    hasContent: computed.notEmpty('value'),
    isValid: computed.and('hasContent', 'validation.isValid', 'notValidating'),
    isInvalid: computed.oneWay('validation.isInvalid'),
    showErrorClass: computed.and('notValidating', 'showMessage', 'hasContent', 'validation'),
    showErrorMessage: computed('validation.isDirty', 'isInvalid', 'didValidate', function() {
        return (this.get('validation.isDirty') || this.get('didValidate')) && this.get('isInvalid');
    }),

    showWarningMessage: computed('validation.isDirty', 'validation.warnings.[]', 'isValid', 'didValidate', function() {
        return (this.get('validation.isDirty') || this.get('didValidate')) && this.get('isValid') && !isEmpty(this.get('validation.warnings'));
    })
});
// END-SNIPPET
