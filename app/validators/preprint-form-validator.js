import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
    title: {
      description: "Title",
        validators: [
            validator('presence', true),
            validator('length', {
                // minimum length for title?
                max: 300,
            })
        ]
    },
    abstract: {
        description: "Abstract",
        validators: [
            validator('presence', true),
            validator('length', {
                // minimum length for abstract?
                max: 5000
            })
        ]
    },
    doi: {
        description: "DOI",
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
