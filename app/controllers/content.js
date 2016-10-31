import Ember from 'ember';
import loadAll from 'ember-osf/utils/load-relationship';
import config from '../config/environment';
import Analytics from '../mixins/analytics';
import permissions from 'ember-osf/const/permissions';

/**
 * Takes an object with query parameter name as the key and value, or [value, maxLength] as the values.
 *
 * @param queryParams {!object}
 * @param queryParams.key {!array|!string}
 * @param queryParams.key[0] {!string}
 * @param queryParams.key[1] {int}
 * @returns {string}
 */
function queryStringify(queryParams) {
    const query = [];

    for (let [param, value] of Object.entries(queryParams)) {
        let maxLength = null;

        if (Array.isArray(value)) {
            maxLength = value[1];
            value = value[0];
        }

        if (!value)
            continue;

        value = encodeURIComponent(value);

        if (maxLength)
            value = value.slice(0, maxLength);

        query.push(`${param}=${value}`);
    }

    return query.join('&');
}

export default Ember.Controller.extend(Analytics, {
    fullScreenMFR: false,
    expandedAuthors: true,
    isAdmin: Ember.computed('node', function() {
        // True if the current user has admin permissions for the node that contains the preprint
        return (this.get('node.currentUserPermissions') || []).includes(permissions.ADMIN);
    }),
    twitterHref: Ember.computed('node', function() {
        const queryParams = {
            url: window.location.href,
            text: this.get('node.title'),
            via: 'OSFramework'
        };

        return `https://twitter.com/intent/tweet?${queryStringify(queryParams)}`;
    }),
    /* TODO: Update this with new Facebook Share Dialog, but an App ID is required
     * https://developers.facebook.com/docs/sharing/reference/share-dialog
     */
    facebookHref: Ember.computed('model', function() {
        const queryParams = {
            app_id: config.FB_APP_ID,
            display: 'popup',
            href: window.location.href,
            redirect_uri: window.location.href
        };

        return `https://www.facebook.com/dialog/share?${queryStringify(queryParams)}`;
    }),
    // https://developer.linkedin.com/docs/share-on-linkedin
    linkedinHref: Ember.computed('node', function() {
        const queryParams = {
            url: [window.location.href, 1024],          // required
            mini: ['true', 4],                          // required
            title: [this.get('node.title'), 200],      // optional
            summary: [this.get('node.description'), 256], // optional
            source: ['Open Science Framework', 200]     // optional
        };

        return `https://www.linkedin.com/shareArticle?${queryStringify(queryParams)}`;
    }),
    emailHref: Ember.computed('node', function() {
        const queryParams = {
            subject: this.get('node.title'),
            body: window.location.href
        };

        return `mailto:?${queryStringify(queryParams)}`;
    }),
    // The currently selected file (defaults to primary)
    activeFile: null,

    disciplineReduced: Ember.computed('model.subjects', function() {
        // Preprint disciplines are displayed in collapsed form on content page
        return this.get('model.subjects').reduce((acc, val) => acc.concat(val), []).uniqBy('id');
    }),

    hasTag: Ember.computed('node.tags', function() {
        return this.get('node.tags').length;
    }),

    getAuthors: Ember.observer('node', function() {
        // Cannot be called until node has loaded!
        const node = this.get('node');
        if (!node) return [];

        const contributors = Ember.A();
        loadAll(node, 'contributors', contributors).then(() =>
            this.set('authors', contributors)
        );
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
                });
            } else {
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
