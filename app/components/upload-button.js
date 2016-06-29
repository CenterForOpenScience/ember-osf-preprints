import Ember from 'ember';

import {
    getAuthUrl
} from 'ember-osf/utils/auth';

export default Ember.Component.extend({
    loggedIn: false, //This ia a fake helper variable so that we can check slash pretend we're logged in
    showModal: false, //TODO: Refactor obviously - there is OBVIOUSLY...a way better way to do tis...DRY!!
    showLogin: false,
    showSignup: false,
    showProjectChooser: false,
    showFileChooser: false,
    showSignupSuccess: false,

    currentUser: Ember.inject.service(),
    session: Ember.inject.service(),
    authUrl: getAuthUrl(),
    user: null,
    _loadCurrentUser() {
        this.get('currentUser').load().then((user) => this.set('user', user));
    },
    actions:{
        submit(){
            this.open('search');
        },
        modalShow(){
            //TODO: If logged in show the login signup modal, else show file chooser
//            if(this.loggedIn===true){
                this.set('showProjectChooser', true);
//            }
//            else {
                //this.set('showModal', true);
//            }
        },
        loginShow(){
            this.set('showLogin', true);
            this.set('showModal', false); //Once again... sigh should be able to move this switching to the HBS too...to the button click could just set all false--seems rough
            this.set('loggedIn', true); //REMOVE LATER
        },
        signupShow(){
            this.set('showSignup', true);
            this.set('showModal', false);
        },
        signupSuccessShow(){
            this.set('showSignupSuccess', true);
            this.set('showSignup', false);
            this.set('loggedIn', true); //REMOVE LATER
        },
        projectChooserShow(){
            this.set('showProjectChooser', true);
            this.set('showLogin', false);
        },
        fileChooserShow(){
            this.set('showFileChooser', true);
            this.set('showProjectChooser', false);
        },
        loginSuccess() {
            this._loadCurrentUser();
            this.sendAction('loginSuccess');
        },
        loginFail() {
            this.sendAction('loginFail');
        }
    }
});
