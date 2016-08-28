import Ember from 'ember';

export default Ember.Controller.extend({
    fullScreenMFR: false,
    expandedAuthors: true,

    // The currently selected file (defaults to primary)
    activeFile: null,

    actions: {
        expandMFR() {
            this.toggleProperty('fullScreenMFR');
        },
        expandAuthors() {
            this.toggleProperty('expandedAuthors');
        },
        chooseFile(fileItem) {
            this.set('activeFile', fileItem);
        }
    },
});
