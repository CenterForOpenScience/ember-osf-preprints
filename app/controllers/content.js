import Ember from 'ember';
import loadAll from 'ember-osf/utils/load-relationship';

export default Ember.Controller.extend({
    keenCounts: null,
    fullScreenMFR: false,
    expandedAuthors: true,

    // The currently selected file (defaults to primary)
    activeFile: null,

    hasTag: Ember.computed('model.tags', function() {
        return this.get('model.tags').length;
    }),

    getAuthors: Ember.observer('model', function() {
        // Cannot be called until preprint has loaded!
        var model = this.get('model');
        if (!model) return [];

        let contributors = Ember.A();
        loadAll(model, 'contributors', contributors).then(()=>
             this.set('authors', contributors));
    }),

    actions: {
        expandMFR() {
            this.toggleProperty('fullScreenMFR');
        },
        expandAuthors() {
            this.toggleProperty('expandedAuthors');
        },
        chooseFile(fileItem) {
            this.set('activeFile', fileItem);
        }
    },
});
