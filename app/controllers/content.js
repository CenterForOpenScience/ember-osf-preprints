import Ember from 'ember';
import loadAll from 'ember-osf/utils/load-relationship';

export default Ember.Controller.extend({
    fullScreenMFR: false,
    expandedAuthors: true,
    twitterHref: Ember.computed('model', function() {
        return encodeURI('https://twitter.com/intent/tweet?url=' + window.location.href + '&text=' + this.get('node.title') + '&via=OSFramework');
    }),
    facebookHref: Ember.computed('model', function() {
        return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href);
    }),
    linkedinHref: Ember.computed('model', function() {
        return 'https://www.linkedin.com/cws/share?url=' + encodeURIComponent(window.location.href) + '&title=' + encodeURIComponent(this.get('node.title'));
    }),
    emailHref: Ember.computed('model', function() {
        return 'mailto:?subject=' + encodeURIComponent(this.get('node.title')) + '&body=' + encodeURIComponent(window.location.href);
    }),
    // The currently selected file (defaults to primary)
    activeFile: null,

    disciplineReduced: Ember.computed('model.subjects', function() {
        return this.get('model.subjects').reduce((acc, val) => acc.concat(val), []).uniqBy('id');
    }),

    hasTag: Ember.computed('node.tags', function() {
        return this.get('node.tags').length;
    }),

    getAuthors: Ember.observer('model', function() {
        // Cannot be called until preprint has loaded!
        var model = this.get('model');
        if (!model) return [];

        let contributors = Ember.A();
        loadAll(this.get('node'), 'contributors', contributors).then(()=>
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
        },
        shareLink(href) {
            window.open(href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=600,height=400');
            return false;
        }
    },
});
