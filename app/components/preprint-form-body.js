import CpPanelBodyComponent from 'ember-collapsible-panel/components/cp-panel-body';

export default CpPanelBodyComponent.extend({
    didInsertElement() {
        this._super(...arguments);
        if (this.$('textarea').length) {
            // Make textarea fill vertical height
            this.$().height('auto');
            this.$('textarea').outerHeight(this.$().height() - this.$('span').height());
            this.$().height('');
        }
    },
});
