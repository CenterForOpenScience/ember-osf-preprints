import Ember from 'ember';
import $ from 'jquery';

export default Ember.Component.extend({
    elementId: 'preprint-file-view',
    startValue: 0,
    scrollAnim: '',
    numShowing: 6,
    selectedFile: {},

    fullList: Ember.computed('files', 'files.[]', 'primaryFile', function(){
        //Returns the list with primaryFile moved to the front
        const files = this.get('files');
        if(files){
            const primaryFile = this.get('primaryFile');
            files.splice(files.indexOf(primaryFile, 1));
            files.unshift(primaryFile);
        }
        return files;
    }),
    supplementList: Ember.computed('fullList', 'fullList.[]', 'startValue', 'numShowing', function(){
        if(this.get('fullList')){
            return this.get('fullList').slice(this.get('startValue'), this.get('startValue') + this.get('numShowing'));
        }
    }),
    init: function(){
        this._super(...arguments);
        this.set('selectedFile', this.get('primaryFile'));
    },
    didInsertElement: function () {
        $('[data-toggle="tooltip"]').tooltip({});
    },
    actions: {
        moveLeft() {
            const start = this.get('startValue');
            const numShowing = this.get('numShowing');
            const fileListLength = this.get('files').length;
            this.set('scrollAnim','toRight');
            if (start - numShowing >= 0){
                this.set('startValue', start-numShowing);
                }
            else{
                this.set('startValue', fileListLength - (fileListLength%numShowing));
                }
            },
        moveRight() {
            const start = this.get('startValue');
            const numShowing = this.get('numShowing');
            const fileListLength = this.get('files').length;
            this.set('scrollAnim', 'toLeft');
            if (start + numShowing <= fileListLength){
                this.set('startValue', start+numShowing);
                }
            else{
                this.set('startValue', 0);
                }
        },
        changeFile(file) {
            this.set('selectedFile', file);
            },
        },
});
