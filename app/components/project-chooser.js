import Component from '@ember/component';

export default Component.extend({
    newFile: false,
    existingFile: false,
    existingProject: false,
    actions: {
        toggleNewFile() {
            this.toggleProperty('newFile');
            this.set('existingFile', false);
            this.set('existingProject', false);
            this.$('#allButtons').children().removeClass('active-custom');
            this.$('#newFileButton').addClass('active-custom');
        },
        toggleExistingFile() {
            this.toggleProperty('existingFile');
            this.set('newFile', false);
            this.set('existingProject', false);
            this.$('#allButtons').children().removeClass('active-custom');
            this.$('#existingFileButton').addClass('active-custom');
        },
        toggleExistingProject() {
            this.toggleProperty('existingProject');
            this.set('newFile', false);
            this.set('existingFile', false);
            this.$('#allButtons').children().removeClass('active-custom');
            this.$('#existingProjectButton').addClass('active-custom');
        },

    },
});
