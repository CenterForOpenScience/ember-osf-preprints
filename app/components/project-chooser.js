import Ember from 'ember';
import $ from 'jquery';

export default Ember.Component.extend({
    newFile: false,
    existingFile: false,
    existingProject: false,
    actions: {
        toggleNewFile(){
            this.toggleProperty('newFile');
            this.set('existingFile', false);
            this.set('existingProject', false);
            $('#allButtons').children().removeClass('active-custom');
            $('#newFileButton').addClass('active-custom');
        },
        toggleExistingFile(){
            this.toggleProperty('existingFile');
            this.set('newFile', false);
            this.set('existingProject', false);
            $('#allButtons').children().removeClass('active-custom');
            $('#existingFileButton').addClass('active-custom');
        },
        toggleExistingProject(){
            this.toggleProperty('existingProject');
            this.set('newFile', false);
            this.set('existingFile', false);
            $('#allButtons').children().removeClass('active-custom');
            $('#existingProjectButton').addClass('active-custom');
        },

    }
});
