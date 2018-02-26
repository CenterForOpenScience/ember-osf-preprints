import Component from '@ember/component';
import { observer } from '@ember/object';
import { validator, buildValidations } from 'ember-cp-validations';

const TitleValidation = buildValidations({
    nodeTitle: {
        description: 'Title',
        validators: [
            validator('presence', true),
            validator('length', {
                // minimum length for title?
                max: 200,
            })
        ]
    },
});
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Preprint-title-editor widget - allows you to add a title if none exists, or edit existing title. Adds validation. Will modify nodeTitle and titleValid.
 *
 * Sample usage:
 * ```handlebars
 * {{preprint-title-editor
 *  nodeTitle=nodeTitle
 *  titlePlaceholder=titlePlaceholder
 *  titleValid=titleValid
}}
 * ```
 * @class preprint-title-editor
 */

export default Component.extend(TitleValidation, {
    nodeTitle: null,
    titlePlaceholder: 'Enter preprint title',
    isValid: observer('nodeTitle', function() {
        if (this.get('nodeTitle') && this.get('validations.isValid')) {
            this.set('titleValid', true);
        } else {
            this.set('titleValid', false);
        }
    })
});
