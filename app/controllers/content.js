import Ember from 'ember';
import loadAll from 'ember-osf/utils/load-relationship';

export default Ember.Controller.extend({
    fullScreenMFR: false,
    expandedAuthors: true,
    expandShare: false,
    twitterHref: Ember.computed('model', function() {
        return encodeURI('https://twitter.com/intent/tweet?url=' + window.location.href + '&text=' + this.get('model.title') + '&via=OSFramework');
    }),
    facebookHref: Ember.computed('model', function() {
        return encodeURI('https://www.facebook.com/sharer/sharer.php?u=' + window.location.href);
    }),
    linkedinHref: Ember.computed('model', function() {
        return encodeURI('https://www.linkedin.com/cws/share?url=' + window.location.href + '&title=' + this.get('model.title'));
    }),
    emailHref: Ember.computed('model', function() {
        return encodeURI('mailto:?subject=' + this.get('model.title') + '&body=' + window.location.href);
    }),
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
        toggleShare() {
            this.toggleProperty('expandShare');
        },
        expandMFR() {
            this.toggleProperty('fullScreenMFR');
        },
        expandAuthors() {
            this.toggleProperty('expandedAuthors');
        },
        chooseFile(fileItem) {
            this.set('activeFile', fileItem);
        },
        shareLink(href) {
            window.open(href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=600,height=400');
            this.toggleProperty('expandShare');
            return false;
        }
    },
});
