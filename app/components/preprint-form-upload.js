import Ember from 'ember';
import CpPanelBodyComponent from 'ember-collapsible-panel/components/cp-panel-body';
import PreprintFormFieldMixin from '../mixins/preprint-form-field';
import loadAll from 'ember-osf/utils/load-relationship';

// Enum of available states
export const State = Ember.Object.extend(Ember.Freezable, {
    START: 'start',
    NEW: 'new',
    EXISTING: 'existing'
}).create().freeze();

const component = CpPanelBodyComponent.extend(PreprintFormFieldMixin, {
    session: Ember.inject.service(),
    currentUser: Ember.inject.service(),
    fileManager: Ember.inject.service(),
    state: State.START,
    uploadState: State.START,
    selectedNode: null,
    user: null,
    userNodes: Ember.A([]),
    init() {
        this._super(...arguments);
        if (this.get('session.isAuthenticated')) {
            this._setCurrentUser();
        }
    },
    _setCurrentUser() {
        this.get('currentUser').load().then(user => this.set('user', user));
    },
    onGetCurrentUser: Ember.observer('user', function() {
        const user = this.get('user');
        if (user) {
            loadAll(user, 'nodes', this.get('userNodes'));
        } else {
            this.set('userNodes', Ember.A());
        }
    }),
    valid: Ember.computed('state', function() {
        const state = this.get('state');
        return [State.NEW, State.EXISTING].find(valid => state === valid);
    }),
    actions: {
        changeState(newState) {
            this.set('state', newState);
        },
        changeUploadState(newState) {
            this.set('uploadState', newState);
        },
        deselectNode() {
            this.set('selectedNode', null);
        },
        selectNodeFile(file) {
            this.send('selectFile', file.get('links.download'));
        },
        selectNode(node) {
            console.log(node);
        },
        selectFile(url) {
            console.log(url);
        },
        preUpload() {
            return new Ember.RSVP.Promise((resolve) => resolve());
        }
    }
});

component.reopen({
    _State: State
});

export default component;
