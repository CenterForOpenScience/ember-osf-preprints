import CpPanelBodyComponent from 'ember-collapsible-panel/components/cp-panel-body';
/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Extends Ember Collapsible Panel's CpPanelBodyComponent.
 *
 * Sample usage:
 * ```handlebars
 * {{#preprint-form-body}}
 *    Insert collapsible panel contents here
 * {{/preprint-form-body}}
 * ```
 * @class preprint-form-body
 */
export default CpPanelBodyComponent.extend({
    didInsertElement() {
        this._super(...arguments);
        if (this.$('textarea').length) {
            // Make textarea fill vertical height
            this.$().height('auto');
            this.$('textarea').outerHeight(this.$().height() - this.$('span').height() - this.$('.col-xs-12').height());
            this.$().height('');
        }
    },
});
