import Ember from 'ember';

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
 * Preprint-title-editor widget - allows you to add a title if none exists, or edit existing title.
 * Adds validation.
 *
 *  Will modify nodeTitle and titleValid.
 *
 * Sample usage:
 * ```handlebars
 * {{preprint-title-editor
 *  nodeTitle=nodeTitle,
 *  titlePlaceholder=titlePlaceholder,
 *  titleValid=titleValid
}}
 * ```
 * @class preprint-title-editor
 */

export default Ember.Component.extend(TitleValidation, {
    nodeTitle: null,
    titlePlaceholder: 'Enter preprint title',
    isValid: Ember.observer('nodeTitle', function() {
        if (this.get('nodeTitle') && this.get('validations.isValid')) {
            this.set('titleValid', true);
        } else {
            this.set('titleValid', false);
        }
    })
});
