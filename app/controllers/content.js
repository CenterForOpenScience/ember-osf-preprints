import Ember from 'ember';
import loadAll from 'ember-osf/utils/load-relationship';
import Analytics from '../mixins/analytics';

export default Ember.Controller.extend(Analytics, {
    fullScreenMFR: false,
    expandedAuthors: true,
    twitterHref: Ember.computed('model', function() {
        return encodeURI('https://twitter.com/intent/tweet?url=' + window.location.href + '&text=' + this.get('model.title') + '&via=OSFramework');
    }),
    facebookHref: Ember.computed('model', function() {
        return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href);
    }),
    linkedinHref: Ember.computed('model', function() {
        return 'https://www.linkedin.com/cws/share?url=' + encodeURIComponent(window.location.href) + '&title=' + encodeURIComponent(this.get('model.title'));
    }),
    emailHref: Ember.computed('model', function() {
        return 'mailto:?subject=' + encodeURIComponent(this.get('model.title')) + '&body=' + encodeURIComponent(window.location.href);
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

    doiUrl: Ember.computed('model.doi', function() {
        return `https://dx.doi.org/${this.get('model.doi')}`;
    }),

    actions: {
        expandMFR() {
            // State of fullScreenMFR before the transition (what the user perceives as the action)
            const beforeState = this.toggleProperty('fullScreenMFR') ? 'Expand' : 'Contract';

            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `Content - MFR ${beforeState}`
                });
        },
        // Unused
        expandAuthors() {
            this.toggleProperty('expandedAuthors');
        },
        // Metrics are handled in the component
        chooseFile(fileItem) {
            this.set('activeFile', fileItem);
        },
        shareLink(href, network, action, label) {
            window.open(href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=600,height=400');

            const metrics = Ember.get(this, 'metrics');

            if (network === 'email') {
                metrics.trackEvent({
                    category: 'link',
                    action,
                    label
                })
            }
            else {
                // TODO submit PR to ember-metrics for a trackSocial function for Google Analytics. For now, we'll use trackEvent.
                metrics.trackEvent({
                    category: network,
                    action,
                    label: window.location.href
                });
            }

            return false;
        }
    },
});
