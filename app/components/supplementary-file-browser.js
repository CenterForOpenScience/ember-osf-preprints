import Ember from 'ember';

export default Ember.Component.extend({
    elementId: 'preprint-file-view',
    startValue: 0,
    scrollAnim: '',
    numShowing: 6,
    selectedFile: {},
    showArrows: Ember.computed('numShowing', 'supplementList.[]', function() {
        return (this.get('numShowing') < this.get('files').length);
    }),
    files: Ember.computed('fileList', 'fileList.[]', 'primaryFile', function() {
        //Returns the list with primaryFile moved to the front
        let files = this.get('fileList');

//      TODO: Grab get primary file from preprint object
        if (files) {
            const fakePrimary = files.get('firstObject');
            this.set('primaryFile', fakePrimary);
            this.set('selectedFile', fakePrimary);
        }
//      TODO: Remove above lines. They are temporary. Pass real primary to component

        if (files && files.length > 1) {
            const primaryFile = this.get('primaryFile');
            files = files.without(primaryFile).toArray();
            files.unshift(primaryFile);
            return files;
        }
    }),
    supplementList: Ember.computed('files', 'files.[]', 'startValue', 'numShowing', function() {
        if (this.get('files')) {
            return this.get('fileList').slice(this.get('startValue'), this.get('startValue') + this.get('numShowing'));
        }
    }),
    init: function() {
        this._super(...arguments);
//        TODO: Add this line, or similar line back in after getting real primary
//        this.set('selectedFile', this.get('primaryFile'));
    },
    actions: {
        moveLeft() {
            const start = this.get('startValue');
            const numShowing = this.get('numShowing');
            const fileListLength = this.get('files').length;
            this.set('scrollAnim', 'toRight');
            if (start - numShowing >= 0) {
                this.set('startValue', start - numShowing);
            }else {
                this.set('startValue', fileListLength - (fileListLength % numShowing));
            }
        },
        moveRight() {
            const start = this.get('startValue');
            const numShowing = this.get('numShowing');
            const fileListLength = this.get('files').length;
            this.set('scrollAnim', 'toLeft');
            if (start + numShowing <= fileListLength) {
                this.set('startValue', start + numShowing);
            }else {
                this.set('startValue', 0);
            }
        },
        changeFile(file) {
            this.set('selectedFile', file);
        },
    },
});
