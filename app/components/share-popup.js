import Component from '@ember/component';

export default Component.extend({
    didInsertElement () {
        this.$('#share-popover').popover();
    },
});
