import Ember from 'ember';

export default Ember.Component.extend({
    elementId: 'preprint-file-view',
    startValue: 0,
    scrollAnim: '',
    numShowing: 6,
    selectedFile: {},
    showRightArrow: Ember.computed('numShowing', 'startValue', function() {
        return (this.get('startValue') + this.get('numShowing') < this.get('files').length);
    }),
    showLeftArrow: Ember.computed('numShowing', 'startValue', function() {
        return (this.get('startValue') !== 0);
    }),
    files: Ember.computed('fileList', 'fileList.[]', 'primaryFile', function() {
        //Return list of files with primaryFile moved to the front
        let files = this.get('fileList');
        if (files && files.length > 1) {
            this.get('primaryFile').then(primaryFile => {
                files = files.without(primaryFile);
                files.insertAt(0, primaryFile);
            });
           return files;
        }
    }),
    supplementList: Ember.computed('files', 'files.[]', 'startValue', 'numShowing', function() {
        //Return the list of length `numShowing` that is displayed
        if (this.get('files')) {
            return this.get('files').slice(this.get('startValue'), this.get('startValue') + this.get('numShowing'));
        }
    }),
    init: function() {
        this.get('primaryFile').then(primaryFile => this.set('selectedFile', primaryFile));
        this._super(...arguments);
    },
    actions: {
        moveLeft() {
            const start = this.get('startValue');
            const numShowing = this.get('numShowing');
            this.set('scrollAnim', 'toRight');
            if (start - numShowing >= 0) {
                this.set('startValue', start - numShowing);
            }
        },
        moveRight() {
            const start = this.get('startValue');
            const numShowing = this.get('numShowing');
            this.set('scrollAnim', 'toLeft');
            if (start + numShowing <= this.get('files').length) {
                this.set('startValue', start + numShowing);
            }
        },
        changeFile(file) {
            this.set('selectedFile', file);
        },
    },
});
