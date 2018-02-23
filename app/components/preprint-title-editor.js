import Ember from 'ember';

import { validator, buildValidations } from 'ember-cp-validations';

const TitleValidation = buildValidations({
    title: {
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
 * Preprint-title-editor widget - allows you to add a title if none exists, or edit existing title. Adds validation. Will modify title and titleValid.
 *
 * Sample usage:
 * ```handlebars
 * {{preprint-title-editor
 *  title=title
 *  titlePlaceholder=titlePlaceholder
 *  titleValid=titleValid
}}
 * ```
 * @class preprint-title-editor
 */

export default Ember.Component.extend(TitleValidation, {
    title: null,
    titlePlaceholder: 'Enter preprint title',
    isValid: Ember.observer('title', function() {
        if (this.get('title') && this.get('validations.isValid')) {
            this.set('titleValid', true);
        } else {
            this.set('titleValid', false);
        }
    })
});
