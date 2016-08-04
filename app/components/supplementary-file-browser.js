import Ember from 'ember';

export default Ember.Component.extend({
    startValue: 0,
    numShowing: 6, //Pull from automatic thing
    fileList: Ember.computed(function(){return this.get('files')}),
    supplementList: Ember.computed('fileList', 'fileList.[]', 'startValue', 'numShowing', function(){
        return this.get('fileList').slice(this.get('startValue'), this.get('startValue') + this.get('numShowing'));
    }),
    actions: {
        moveLeft() {
            const start = this.get('startValue');
            const numShowing = this.get('numShowing');
            const fileListLength = this.get('fileList').length;
            if (start + numShowing <= fileListLength)
                this.set('startValue', start+numShowing);
            else
                this.set('startValue', 0);
                },
        },
});
