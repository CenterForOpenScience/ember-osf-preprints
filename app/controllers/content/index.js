import Ember from 'ember';
import DS from 'ember-data';
import loadAll from 'ember-osf/utils/load-relationship';
import config from 'ember-get-config';
import Analytics from '../../mixins/analytics';
import permissions from 'ember-osf/const/permissions';

/**
 * Takes an object with query parameter name as the key and value, or [value, maxLength] as the values.
 *
 * @method queryStringify
 * @param queryParams {!object}
 * @param queryParams.key {!array|!string}
 * @param queryParams.key[0] {!string}
 * @param queryParams.key[1] {int}
 * @return {string}
 */
function queryStringify(queryParams) {
    const query = [];

    // TODO set up ember to transpile Object.entries
    for (const param in queryParams) {
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

/**
 * @module ember-preprints
 * @submodule controllers
 */

/**
 * @class Content Controller
 */
export default Ember.Controller.extend(Analytics, {
    theme: Ember.inject.service(),
    fullScreenMFR: false,
    showLicenseText: false,
    expandedAbstract: navigator.userAgent.includes('Prerender'),
    queryParams: {
        chosenFile: 'file'
    },
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
    chosenFile: null,

    disciplineReduced: Ember.computed('model.subjects', function() {
        // Preprint disciplines are displayed in collapsed form on content page
        return this.get('model.subjects').reduce((acc, val) => acc.concat(val), []).uniqBy('id');
    }),

    hasTag: Ember.computed.bool('node.tags.length'),

    authors: Ember.computed('node', function() {
        // Cannot be called until node has loaded!
        const node = this.get('node');

        if (!node)
            return [];

        const contributors = Ember.A();

        return DS.PromiseArray.create({
            promise: loadAll(node, 'contributors', contributors)
                .then(() => contributors)
        });
    }),

    doiUrl: Ember.computed('model.doi', function() {
        return `https://dx.doi.org/${this.get('model.doi')}`;
    }),

    fullLicenseText: Ember.computed('model.license.text', 'model.licenseRecord', function() {
        const text = this.get('model.license.text') || '';
        const {year = '', copyright_holders = []} = this.get('model.licenseRecord');

        return text
            .replace(/({{year}})/g, year)
            .replace(/({{copyrightHolders}})/g, copyright_holders.join(', '));
    }),

    hasShortenedDescription: Ember.computed('node.description', function() {
        const nodeDescription = this.get('node.description');

        return nodeDescription && nodeDescription.length > 350;
    }),

    useShortenedDescription: Ember.computed('expandedAbstract', 'hasShortenedDescription', function() {
        return this.get('hasShortenedDescription') && !this.get('expandedAbstract');
    }),

    description: Ember.computed('node.description', function() {
        // Get a shortened version of the abstract, but doesn't cut in the middle of word by going
        // to the last space.
        return this.get('node.description')
            .slice(0, 350)
            .replace(/\s+\S*$/, '');
    }),

    actions: {
        toggleLicenseText() {
            const licenseState = this.toggleProperty('showLicenseText') ? 'Expand' : 'Contract';
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `Preprints - Content - License ${licenseState}`
                });
        },
        expandMFR() {
            // State of fullScreenMFR before the transition (what the user perceives as the action)
            const beforeState = this.toggleProperty('fullScreenMFR') ? 'Expand' : 'Contract';

            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'button',
                    action: 'click',
                    label: `Preprints - Content - MFR ${beforeState}`
                });
        },
        expandAbstract() {
            this.toggleProperty('expandedAbstract');
        },
        // Metrics are handled in the component
        chooseFile(fileItem) {
            this.setProperties({
                chosenFile: fileItem.get('id'),
                activeFile: fileItem
            });
        },
        shareLink(href, category, action, label) {
            const metrics = Ember.get(this, 'metrics');

            // TODO submit PR to ember-metrics for a trackSocial function for Google Analytics. For now, we'll use trackEvent.
            metrics.trackEvent({
                category,
                action,
                label
            });

            if (label.includes('email'))
               return;

            window.open(href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=600,height=400');
            return false;
        }
    },
});
