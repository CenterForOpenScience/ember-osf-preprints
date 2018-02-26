import Component from '@ember/component';

export default Component.extend({
    didInsertElement: function () {
        this.$('#share-popover').popover();
    },
});
