import Ember from 'ember';

/**
 * Convert Or Copy Widget - very simple, just presents decision, do you want to convert this project
 *  or copy file to a new component.
 *
 *  Will set passed in argument createComponent to true or false.
 *
 * Sample usage:
 * ```handlebars
 * {{convert-or-copy-project
 *  convertOrCopy=convertOrCopy
}}
 * ```
 * @class convert-or-copy-project
 */
export default Ember.Component.extend({
    actions: {
        copyToComponent() {
            this.set('convertOrCopy', 'copy');
        },
        convertExisting() {
            this.set('convertOrCopy', 'convert');
        },
    }
});
