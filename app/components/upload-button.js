import Ember from 'ember';

export default Ember.Component.extend({
    showModal: false,
    actions:{
        submit(){
            this.open('search');
        },
        modalShow(){
            this.set('showModal', true);
        },
        modalHide(){
            this.set('showModal', false);
        },
        openModal(){
            this.set('showModal', false);
        }
    }
});
