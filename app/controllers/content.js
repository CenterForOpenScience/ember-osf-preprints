import Ember from 'ember';
import loadAll from 'ember-osf/utils/load-relationship';

/**
 * Takes an object with query parameter name as the key and [value, maxLength] as the values.
 *
 * @param queryParams {!object}
 * @param queryParams.key {!array|!string}
 * @param queryParams.key[0] {!string}
 * @param queryParams.key[1] {int}
 * @returns {string}
 */
function queryStringify(queryParams) {
    const query = [];

    for (let param in queryParams) {
        let value = queryParams[param];
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

export default Ember.Controller.extend({
    fullScreenMFR: false,
    expandedAuthors: true,
    twitterHref: Ember.computed('model', function() {
        const queryParams = {
            url: window.location.href,
            text: this.get('model.title'),
            via: 'OSFramework'
        };

        return `https://twitter.com/intent/tweet?${queryStringify(queryParams)}`;
    }),
    /* TODO: Update this with new Facebook Share Dialog, but an App ID is required
     * https://developers.facebook.com/docs/sharing/reference/share-dialog
     */
    facebookHref: Ember.computed('model', function() {
        const queryParams = {
            u: window.location.href
        };

        return `https://www.facebook.com/sharer/sharer.php?${queryStringify(queryParams)}`;
    }),
    // https://developer.linkedin.com/docs/share-on-linkedin
    linkedinHref: Ember.computed('model', function() {
        const queryParams = {
            url: [window.location.href, 1024],          // required
            mini: ['true', 4],                          // required
            title: [this.get('model.title'), 200],      // optional
            summary: [this.get('model.abstract'), 256], // optional
            source: ['Open Science Framework', 200]     // optional
        };

        return `https://www.linkedin.com/shareArticle?${queryStringify(queryParams)}`;
    }),
    emailHref: Ember.computed('model', function() {
        const queryParams = {
            subject: this.get('model.title'),
            body: window.location.href
        };

        return `mailto:?${queryStringify(queryParams)}`;
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
