import Ember from 'ember';

export default Ember.Component.extend({
    startValue: 0,
    numShowing: 6, //Pull from automatic thing
//    selectedFile: primaryFile,
    selectedFile: {name: 'hello.txt', links:{download: "https://test-files.osf.io/v1/resources/qudgr/providers/osfstorage/57a379cbda3e24004afba2d5"}},
    supplementList: Ember.computed('files', 'files.[]', 'startValue', 'numShowing', function(){
        return this.get('files').slice(this.get('startValue'), this.get('startValue') + this.get('numShowing'));
    }),
    actions: {
        moveLeft() {
            const start = this.get('startValue');
            const numShowing = this.get('numShowing');
            const fileListLength = this.get('files').length;
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
