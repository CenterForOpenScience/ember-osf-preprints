import { A, isArray } from '@ember/array';
import { inject as service } from '@ember/service';
import { run } from '@ember/runloop';
import loadAll from 'ember-osf/utils/load-relationship';
import Route from '@ember/routing/route';
import $ from 'jquery';
import Analytics from 'ember-osf/mixins/analytics';
import config from 'ember-get-config';
import extractDoiFromString from 'ember-osf/utils/extract-doi-from-string';

import ResetScrollMixin from '../../mixins/reset-scroll';

const {
    OSF: { url: osfUrl },
} = config;

// Error handling for API
const handlers = new Map([
    // format: ['Message detail', 'page']
    ['Authentication credentials were not provided.', 'page-not-found'], // 401
    ['You do not have permission to perform this action.', 'page-not-found'], // 403
    ['Not found.', 'page-not-found'], // 404
    ['The requested node is no longer available.', 'resource-deleted'], // 410
]);

/**
 * @module ember-preprints
 * @submodule routes
 */

/**
 * Fetches current preprint. Redirects to preprint provider route if necessary.
 * @class Content Route Handler
 */
export default Route.extend(Analytics, ResetScrollMixin, {
    theme: service(),
    headTagsService: service('head-tags'),
    currentUser: service('currentUser'),
    toast: service('toast'),
    i18n: service(),

    downloadUrl: '',
    preprint: null,
    node: null,
    waitForMetaData: navigator.userAgent.includes('Prerender'),
    contributors: A(),


    afterModel(preprint) {
        const { location: { origin } } = window;

        const downloadUrl = [
            origin,
            this.get('theme.isSubRoute') ? `preprints/${this.get('theme.id')}` : null,
            preprint.get('id'),
            'download',
        ]
            .filter(part => !!part)
            .join('/');
        this.set('downloadUrl', downloadUrl);

        this.set('fileDownloadURL', downloadUrl);
        this.set('preprint', preprint);
        this.set('apiMeta', preprint.get('apiMeta'));

        if (!preprint.get('dateWithdrawn')) {
            const setupMetaData = preprint.get('provider')
                .then(this._getProviderDetails.bind(this))
                .then(this._getUserPermissions.bind(this))
                .then(this._setupMetaData.bind(this));

            const setupPreprint = this._getPrimaryFile()
                .then(this._loadSupplementalNode.bind(this));

            return this.get('waitForMetaData') ? setupMetaData : setupPreprint;
        }
    },

    setupController(controller, model) {
        controller.setProperties({
            primaryFile: model.get('primaryFile'),
            node: this.get('node'),
            fileDownloadURL: this.get('fileDownloadURL'),
            isPendingWithdrawal: this.get('isPendingWithdrawal'),
            isWithdrawn: model.get('dateWithdrawn') !== null,
            apiMeta: this.get('apiMeta'),
        });

        run.scheduleOnce('afterRender', this, function() {
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, [$('.abstract')[0], $('#preprintTitle')[0]]]);
        });

        return this._super(...arguments);
    },

    actions: {
        error(error) {
            // Handle API Errors
            if (error && error.errors && isArray(error.errors)) {
                const { detail } = error.errors[0];
                const page = handlers.get(detail) || 'page-not-found';
                return this.intermediateTransitionTo(page);
            }
        },
        didTransition() {
            const ev = document.createEvent('HTMLEvents');
            ev.initEvent('ZoteroItemUpdated', true, true);
            document.dispatchEvent(ev);
            return true; // Bubble the didTransition event
        },
    },

    _getProviderDetails(provider) {
        const providerId = provider.get('id');
        const themeId = this.get('theme.id');
        const isOSF = providerId === 'osf';
        const preprint = this.get('preprint');

        // If we're on the proper branded site, stay here.
        if (themeId === providerId) {
            return Promise.all([
                provider,
            ]);
        }

        window.location.replace(`${osfUrl}${isOSF ? '' : `preprints/${providerId}/`}${preprint.get('id')}/`);
        return Promise.reject();
    },

    _getPrimaryFile() {
        return this.store.findRecord('file', this.get('preprint.primaryFile.id'), { reload: true })
            .then(this._successLoadingPrimaryFile.bind(this))
            .catch(this._errorLoadingPrimaryFile.bind(this));
    },

    _loadSupplementalNode() {
        if (this.get('preprint.node.id')) {
            return this.store.findRecord('node', this.get('preprint.node.id'))
                .then(this._successLoadingSupplemental.bind(this))
                .catch(this._errorLoadingSupplemental.bind(this));
        }
    },

    _successLoadingPrimaryFile(primaryFile) {
        return this.set('primaryFile', primaryFile);
    },

    _errorLoadingPrimaryFile() {
        this.get('toast').error(this.get('i18n').t('content.error_loading_preprint_file'));
    },

    _successLoadingSupplemental(node) {
        return this.set('node', node);
    },

    _errorLoadingSupplemental() {
        // User does not have permission to view the supplemental node - is private
        return this.set('node', null);
    },

    _getUserPermissions([provider]) {
        const contributors = this.get('contributors');
        const preprint = this.get('preprint');

        return Promise.all([
            provider,
            preprint.get('license'),
            loadAll(preprint, 'contributors', contributors, { filter: { bibliographic: true } }),
        ]);
    },

    _setupMetaData([provider, license]) {
        const { origin } = window.location;
        const preprint = this.get('preprint');
        const title = preprint.get('title');
        const description = preprint.get('description');
        const facebookAppId = provider.get('facebookAppId') || config.FB_APP_ID;
        const mintDoi = extractDoiFromString(preprint.get('preprintDoiUrl'));
        const peerDoi = preprint.get('doi');
        const image = this.get('theme.logoSharing');
        const imageUrl = /^https?:\/\//.test(image.path) ? image.path : origin + image.path;
        const dateCreated = new Date(preprint.get('dateCreated') || null);
        const dateModified = new Date(preprint.get('dateModified') || dateCreated);
        if (!preprint.get('datePublished')) { preprint.set('datePublished', dateCreated); }
        const providerName = provider.get('name') === 'Open Science Framework' ? 'OSF Preprints' : provider.get('name');
        const canonicalUrl = preprint.get('links.html');
        const contributors = this.get('contributors');
        const downloadUrl = this.get('downloadUrl');

        // NOTE: Ordering of meta tags matters for scrapers
        // EX: (Facebook, LinkedIn, Google, etc)

        // Open Graph Protocol
        const openGraph = [
            ['fb:app_id', facebookAppId],
            ['og:title', title],
            ['og:image', imageUrl],
            ['og:image:width', image.width.toString()],
            ['og:image:height', image.height.toString()],
            ['og:image:type', image.type],
            ['og:url', canonicalUrl],
            ['og:description', description],
            ['og:site_name', providerName],
            ['og:type', 'article'],
            ['article:published_time', dateCreated.toISOString()],
            ['article:modified_time', dateModified.toISOString()],
        ];

        // Highwire Press
        const highwirePress = [
            ['citation_title', title],
            ['citation_description', description],
            ['citation_public_url', canonicalUrl],
            ['citation_online_date', `${dateCreated.getFullYear()}/${dateCreated.getMonth() + 1}/${dateCreated.getDate()}`],
        ];
        if (mintDoi) {
            highwirePress.push(['citation_doi', mintDoi]);
        }

        // TODO map Eprints fields
        // Eprints
        const eprints = [];

        // TODO map BE Press fields
        // BE Press
        const bePress = [];

        // TODO map PRISM fields
        // PRISM
        const prism = [];

        // Dublin Core
        const dublinCore = [
            ['dc.title', title],
            ['dc.abstract', description],
            ['dc.identifier', canonicalUrl],
        ];
        if (mintDoi) {
            dublinCore.push(['dc.identifier', `doi:${mintDoi}`]);
        }
        if (peerDoi) {
            dublinCore.push(['dc.relation', `doi:${peerDoi}`]);
        }

        const tags = [
            ...preprint.get('subjects').map(subjectBlock => subjectBlock.map(subject => subject.text)),
            ...preprint.get('tags'),
        ];

        for (const tag of tags) {
            openGraph.push(['article:tag', tag]);
            highwirePress.push(['citation_keywords', tag]);
            dublinCore.push(['dc.subject', tag]);
        }

        for (const contributor of contributors) {
            let givenName = contributor.get('users.givenName');
            let familyName = contributor.get('users.familyName');
            let fullName = contributor.get('users.fullName');

            // If the contributor is unregistered, use the
            // unregistered_contributor field for first/last/middle names
            if (contributor.get('unregisteredContributor')) {
                const unregisteredName = contributor.get('unregisteredContributor').split(' ');
                [givenName] = unregisteredName;
                familyName = unregisteredName.length > 1 ? unregisteredName.pop() : '';
                fullName = contributor.get('unregisteredContributor');
            }

            openGraph.push(
                ['og:type', 'article:author'],
                ['profile:first_name', givenName],
                ['profile:last_name', familyName],
            );
            highwirePress.push(['citation_author', fullName]);
            dublinCore.push(['dc.creator', fullName]);
        }

        highwirePress.push(['citation_publisher', providerName]);
        dublinCore.push(
            ['dc.publisher', providerName],
            ['dc.license', license ? license.get('name') : 'No license'],
        );

        highwirePress.push(['citation_pdf_url', `${downloadUrl}?format=pdf`]);

        const openGraphTags = openGraph
            .map(([property, content]) => ({
                property,
                content,
            }));

        const googleScholarTags = [
            highwirePress,
            eprints,
            bePress,
            prism,
            dublinCore,
        ]
            .reduce((a, b) => a.concat(b), [])
            .map(([name, content]) => ({
                name,
                content,
            }));

        const headTags = [
            ...openGraphTags,
            ...googleScholarTags,
        ]
            .filter(({ content }) => content) // Only show tags with content
            .map(attrs => ({
                type: 'meta',
                attrs,
            }));

        this.set('headTags', headTags);
        this.get('headTagsService').collectHeadTags();
        run.scheduleOnce('afterRender', this, function() {
            const controller = this.controllerFor('content.index');
            controller.set('isPlauditReady', true);
        });
    },
});
