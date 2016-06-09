import Ember from 'ember';

export default Ember.Component.extend({
    newFile: false,
    existingFile: false,
    existingProject: false,
    actions: {
        toggleNewFile(){
            this.toggleProperty('newFile');
            this.set('existingFile', false);
            this.set('existingProject', false);
        },
        toggleExistingFile(){
            this.toggleProperty('existingFile');
            this.set('newFile', false);
            this.set('existingProject', false);
        },
        toggleExistingProject(){
            this.toggleProperty('existingProject');
            this.set('newFile', false);
            this.set('existingFile', false);
        },
    }
});
