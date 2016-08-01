import Ember from 'ember';
import { getAuthUrl } from 'ember-osf/utils/auth';

export default Ember.Component.extend({

    currentUser: Ember.inject.service(),
    session: Ember.inject.service(),
    authUrl: getAuthUrl(),
    user: null,
    _loadCurrentUser() {
        this.get('currentUser').load().then(user => this.set('user', user));
    },
    actions: {
        submit() {
            this.open('search');
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
