import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
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
    abstract: {
        description: 'Abstract',
        validators: [
            validator('presence', true),
            validator('length', {
                // currently min of 20 characters -- this is what arXiv has as the minimum length of an abstract
                min: 20,
                max: 5000
            })
        ]
    },
    doi: {
        description: 'DOI',
        validators: [
            validator('format', {
                // Regex taken from http://stackoverflow.com/questions/27910/finding-a-doi-in-a-document-or-page
                regex: /\b(10[.][0-9]{4,}(?:[.][0-9]+)*(?:(?!["&\'<>])\S)+)\b/,
                allowBlank: true,
                message: 'Please use a valid {description}'
            })
        ]
    }
});

export default Validations;
