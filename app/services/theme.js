import { computed } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import $ from 'jquery';
import config from 'ember-get-config';
import buildProviderAssetPath from '../utils/build-provider-asset-path';

/**
 * @module ember-preprints
 * @submodule services
 */

/**
 * Detects preprint provider and allows you to inject that
 * provider's theme into parts of your application
 *
 * @class theme
 * @extends Service
 */
export default Service.extend({
    store: service(),
    session: service(),
    headTagsService: service('head-tags'),

    // If we're using a provider domain
    isDomain: window.isProviderDomain,

    // The id of the current provider
    id: config.PREPRINTS.defaultProvider,

    currentLocation: null,

    // The provider object
    provider: computed('id', function() {
        const id = this.get('id');
        const store = this.get('store');

        // Check if redirect is enabled for the current provider
        if (!window.isProviderDomain && this.get('isProvider')) {
            store.findRecord('preprint-provider', id)
                .then(this._getproviderDomain.bind(this));
        }

        return store.findRecord('preprint-provider', id);
    }),

    _getproviderDomain(provider) {
        if (provider.get('domainRedirectEnabled')) {
            const domain = provider.get('domain');
            const { href, origin } = window.location;
            const id = this.get('id');
            const url = href.replace(new RegExp(`^${origin}/preprints/${id}/?`), domain);

            window.location.replace(url);
        }
    },

    providerCallback(provider, id) {
        if (provider.get('domainRedirectEnabled')) {
            const domain = provider.get('domain');
            const { href, origin } = window.location;
            const url = href.replace(new RegExp(`^${origin}/preprints/${id}/?`), domain);

            window.location.replace(url);
        }
    },

    // If we're using a branded provider
    isProvider: computed('id', function() {
        return this.get('id') !== 'osf';
    }),

    // If we should include the preprint word in the title
    preprintWordInTitle: computed('id', function() {
        return this.get('id') !== 'thesiscommons';
    }),

    // If we're using a branded provider and not under a branded domain (e.g. /preprints/<provider>)
    isSubRoute: computed('isProvider', 'isDomain', function() {
        return this.get('isProvider') && !this.get('isDomain');
    }),

    pathPrefix: computed('isProvider', 'isDomain', 'id', function() {
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
    guidPathPrefix: computed('isSubRoute', 'id', function() {
        let pathPrefix = '/';

        if (this.get('isSubRoute')) {
            pathPrefix += `preprints/${this.get('id')}/`;
        }

        return pathPrefix;
    }),
    // The logo object for social sharing
    logoSharing: computed('id', 'isDomain', function() {
        const id = this.get('id');
        return {
            path: buildProviderAssetPath(config, id, 'sharing.png', this.get('isDomain')),
            type: 'image/png',
            width: 1200,
            height: 630,
        };
    }),

    // The url to redirect users to sign up to
    signupUrl: computed('id', function() {
        const query = $.param({
            campaign: `${this.get('id')}-preprints`,
            next: window.location.href,
        });

        return `${config.OSF.url}register?${query}`;
    }),

    redirectUrl: computed('currentLocation', function() {
        return this.get('currentLocation');
    }),

    headTags: computed('id', function() {
        return [{
            type: 'link',
            attrs: {
                rel: 'shortcut icon',
                href: buildProviderAssetPath(config, this.get('id'), 'favicon.ico', window.isProviderDomain),
            },
        }];
    }),
    idChanged: computed('id', function() {
        this.get('headTagsService').collectHeadTags();
    }),
});
