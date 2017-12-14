import Ember from 'ember';
import config from 'ember-get-config';
import pathJoin from '../utils/path-join';
import buildProviderAssetPath from '../utils/build-provider-asset-path';

/**
 * @module ember-preprints
 * @submodule services
 */

/**
 * Detects preprint provider and allows you to inject that provider's theme into parts of your application
 *
 * @class theme
 * @extends Ember.Service
 */
export default Ember.Service.extend({
    store: Ember.inject.service(),
    session: Ember.inject.service(),
    headTagsService: Ember.inject.service('head-tags'),

    // If we're using a provider domain
    isDomain: window.isProviderDomain,

    // The id of the current provider
    id: config.PREPRINTS.defaultProvider,

    currentLocation: null,

    // The provider object
    provider: Ember.computed('id', function() {
        const id = this.get('id');
        const store = this.get('store');

        // Check if redirect is enabled for the current provider
        if (!window.isProviderDomain && this.get('isProvider')) {
            store.findRecord('preprint-provider', id)
                .then(provider => {
                    if (provider.get('domainRedirectEnabled')) {
                        const domain = provider.get('domain');
                        const {href, origin} = window.location;
                        const url = href.replace(new RegExp(`^${origin}/preprints/${id}/?`), domain);

                        window.location.replace(url);
                    }
                });
        }

        return store.findRecord('preprint-provider', id);
    }),

    // If we're using a branded provider
    isProvider: Ember.computed('id', function() {
        return this.get('id') !== 'osf';
    }),

    // If we should include the preprint word in the title
    preprintWordInTitle: Ember.computed('id', function() {
        return this.get('id') !== 'thesiscommons';
    }),

    // If we're using a branded provider and not under a branded domain (e.g. /preprints/<provider>)
    isSubRoute: Ember.computed('isProvider', 'isDomain', function() {
        return this.get('isProvider') && !this.get('isDomain');
    }),

    pathPrefix: Ember.computed('isProvider', 'isDomain', 'id', function() {
        let pathPrefix = '/';

        if (!this.get('isDomain')) {
            pathPrefix += 'preprints/';

            if (this.get('isProvider')) {
                pathPrefix += `${this.get('id')}/`;
            }
        }

        return pathPrefix;
    }),

    // Needed for the content route
    guidPathPrefix: Ember.computed('isSubRoute', 'id', function() {
        let pathPrefix = '/';

        if (this.get('isSubRoute')) {
            pathPrefix += `preprints/${this.get('id')}/`;
        }

        return pathPrefix;
    }),
    // The logo object for social sharing
    logoSharing: Ember.computed('id', 'isDomain', function() {
        const id = this.get('id');
        let logo = {};
        if (id === 'osf') {
            logo = config.PREPRINTS.providers
                .find(provider => provider.id === id)
                .logoSharing;

            logo.path = pathJoin('/preprints', logo.path);
        } else {
            logo = {
                path: buildProviderAssetPath(config, id, 'sharing.png', this.get('isDomain')),
                type: 'image/png',
                width: 1200,
                height: 630
            }
        }
        return logo;
    }),

    // The url to redirect users to sign up to
    signupUrl: Ember.computed('id', function() {
        const query = Ember.$.param({
            campaign: `${this.get('id')}-preprints`,
            next: window.location.href
        });

        return `${config.OSF.url}register?${query}`;
    }),

    redirectUrl: Ember.computed('currentLocation', function() {
        return this.get('currentLocation');
    }),

    headTags: Ember.computed('id', function() {
        return [{
            type: 'link',
            attrs: {
                rel: 'shortcut icon',
                href: buildProviderAssetPath(config, this.get('id'), 'favicon.ico', window.isProviderDomain)
            }
        }]
    }),
    idChanged: Ember.observer('id', function() {
        this.get('headTagsService').collectHeadTags();
    }),
});
