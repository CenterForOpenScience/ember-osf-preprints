import Ember from 'ember';

export default Ember.Component.extend({
    showModal: false, //TODO: Refactor obviously - there is OBVIOUSLY...a way better way to do tis...DRY!!
    showLogin: false,
    showSignup: false,
    showProjectChooser: false,
    showFileChooser: false,
    showSignupSuccess: false,
    actions:{
        submit(){
            this.open('search');
        },
        modalShow(){
            this.set('showModal', true);
        },
        loginShow(){
            this.set('showLogin', true);
            this.set('showModal', false); //Once again... sigh should be able to move this switching to the HBS too...to the button click could just set all false--seems rough
        },
        signupShow(){
            this.set('showSignup', true);
            this.set('showModal', false);
        },
        signupSuccessShow(){
            this.set('showSignupSuccess', true);
            this.set('showSignup', false);
        },
        projectsShow(){
            this.set('showProjectChooser', true);
        },
        fileShow(){
            this.set('showFileChooser', true);
        }
    }
});
