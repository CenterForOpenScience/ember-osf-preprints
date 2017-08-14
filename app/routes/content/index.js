import Ember from 'ember';
import ResetScrollMixin from '../../mixins/reset-scroll';
import SetupSubmitControllerMixin from '../../mixins/setup-submit-controller';
import Analytics from 'ember-osf/mixins/analytics';
import config from 'ember-get-config';
import loadAll from 'ember-osf/utils/load-relationship';
import permissions from 'ember-osf/const/permissions';
import extractDoiFromString from 'ember-osf/utils/extract-doi-from-string';

const {
    OSF: {url: osfUrl}
} = config;

// Error handling for API
const handlers = new Map([
    // format: ['Message detail', 'page']
    ['Authentication credentials were not provided.', 'page-not-found'], // 401
    ['You do not have permission to perform this action.', 'page-not-found'], // 403
    ['Not found.', 'page-not-found'], // 404
    ['The requested node is no longer available.', 'resource-deleted'] // 410
]);

/**
 * @module ember-preprints
 * @submodule routes
 */

/**
 * Fetches current preprint. Redirects to preprint provider route if necessary.
 * @class Content Route Handler
 */
export default Ember.Route.extend(Analytics, ResetScrollMixin, SetupSubmitControllerMixin, {
    theme: Ember.inject.service(),
    headTagsService: Ember.inject.service('head-tags'),
    currentUser: Ember.inject.service('currentUser'),

    afterModel(preprint) {
        const {location: {origin}} = window;
        let contributors = Ember.A();

        const downloadUrl = [
            origin,
            this.get('theme.isSubRoute') ? `preprints/${this.get('theme.id')}` : null,
            preprint.get('id'),
            'download'
        ]
            .filter(part => !!part)
            .join('/');

        this.set('fileDownloadURL', downloadUrl);

        return preprint.get('provider')
            .then(provider => {
                const providerId = provider.get('id');
                const themeId = this.get('theme.id');
                const isOSF = providerId === 'osf';

                // If we're on the proper branded site, stay here.
                if (themeId === providerId)
                    return Promise.all([
                        provider,
                        preprint.get('node')
                    ]);

                window.location.replace(`${osfUrl}${isOSF ? '' : `preprints/${providerId}/`}${preprint.get('id')}/`);
                return Promise.reject();
            })
            .then(([provider, node]) => {
                this.set('node', node);

                if (this.get('editMode')) {
                    const userPermissions = this.get('node.currentUserPermissions') || [];

                    if (!userPermissions.includes(permissions.ADMIN)) {
                        this.replaceWith('forbidden'); // Non-admin trying to access edit form.
                    }
                }

                return Promise.all([
                    provider,
                    node,
                    preprint.get('license'),
                    loadAll(node, 'contributors', contributors)
                ]);
            })
            .then(([provider, node, license]) => {
                const title = node.get('title');
                const description = node.get('description');
                const mintDoi = extractDoiFromString(preprint.get('links.preprint_doi'));
                const peerDoi = preprint.get('doi');
                const doi = peerDoi ? peerDoi : mintDoi;
                const image = this.get('theme.logoSharing');
                const imageUrl = `${origin.replace(/^https/, 'http')}${image.path}`;
                const dateCreated = new Date(preprint.get('dateCreated') || null);
                const dateModified = new Date(preprint.get('dateModified') || dateCreated);
                if (!preprint.get('datePublished'))
                    preprint.set('datePublished', dateCreated);
                const providerName = provider.get('name');
                const canonicalUrl = preprint.get('links.html');

                // NOTE: Ordering of meta tags matters for scrapers (Facebook, LinkedIn, Google, etc)

                // Open Graph Protocol
                const openGraph = [
                    ['fb:app_id', config.FB_APP_ID],
                    ['og:title', title],
                    ['og:image', imageUrl],
                    ['og:image:secure_url', `${origin}${image.path}`], // We should always be on https in staging/prod
                    ['og:image:width', image.width.toString()],
                    ['og:image:height', image.height.toString()],
                    ['og:image:type', image.type],
                    ['og:url', canonicalUrl],
                    ['og:description', description],
                    ['og:site_name', providerName],
                    ['og:type', 'article'],
                    ['article:published_time', dateCreated.toISOString()],
                    ['article:modified_time', dateModified.toISOString()]
                ];

                // Highwire Press
                var highwirePress = [
                    ['citation_title', title],
                    ['citation_description', description],
                    ['citation_public_url', canonicalUrl],
                    ['citation_publication_date', `${dateCreated.getFullYear()}/${dateCreated.getMonth() + 1}/${dateCreated.getDate()}`],
                ];
                if (doi) {
                    highwirePress.push(
                        ['citation_doi', doi]
                    );
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
                var dublinCore = [
                    ['dc.title', title],
                    ['dc.abstract', description],
                    ['dc.identifier', canonicalUrl],
                ];
                if (mintDoi) {
                    dublinCore.push(
                        ['dc.identifier', 'doi:' + mintDoi]
                    );
                }
                if (peerDoi) {
                    dublinCore.push(
                        ['dc.relation', 'doi:' + peerDoi]
                    );
                }

                const tags = [
                    ...preprint.get('subjects').map(subjectBlock => subjectBlock.map(subject => subject.text)),
                    ...node.get('tags')
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

                    // If the contributor is unregistered, use the unregistered_contributor field for first/last/middle names
                    if(contributor.get('unregisteredContributor')) {
                        let unregisteredName = contributor.get('unregisteredContributor').split(" ");
                        givenName = unregisteredName[0];
                        familyName = unregisteredName.length > 1 ? unregisteredName.pop() : '';
                        fullName = contributor.get('unregisteredContributor');
                    }

                    openGraph.push(
                        ['og:type', 'article:author'],
                        ['profile:first_name', givenName],
                        ['profile:last_name', familyName]
                    );
                    highwirePress.push(['citation_author', fullName]);
                    dublinCore.push(['dc.creator', fullName]);
                }

                highwirePress.push(['citation_publisher', providerName]);
                dublinCore.push(
                    ['dc.publisher', providerName],
                    ['dc.license', license ? license.get('name') : 'No license']
                );

                highwirePress.push(['citation_pdf_url', `${downloadUrl}?format=pdf`]);

                const openGraphTags = openGraph
                    .map(([property, content]) => ({
                        property,
                        content
                    }));

                const googleScholarTags = [
                    highwirePress,
                    eprints,
                    bePress,
                    prism,
                    dublinCore
                ]
                    .reduce((a, b) => a.concat(b), [])
                    .map(([name, content]) => ({
                        name,
                        content
                    }));

                const headTags = [
                    ...openGraphTags,
                    ...googleScholarTags
                ]
                    .filter(({content}) => content) // Only show tags with content
                    .map(attrs => ({
                        type: 'meta',
                        attrs
                    }));

                this.set('headTags', headTags);
                this.get('headTagsService').collectHeadTags();
            });
    },

    setupController(controller, model) {
        controller.setProperties({
            activeFile: model.get('primaryFile'),
            node: this.get('node'),
            fileDownloadURL: this.get('fileDownloadURL'),
        });

        Ember.run.scheduleOnce('afterRender', this, function() {
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, [Ember.$('.abstract')[0], Ember.$('#preprintTitle')[0]]]);  // jshint ignore:line
        });

        return this._super(...arguments);
    },

    actions: {
        error(error) {
            // Handle API Errors
            if (error && error.errors && Ember.isArray(error.errors)) {
                const {detail} = error.errors[0];
                const page = handlers.get(detail) || 'page-not-found';

                return this.intermediateTransitionTo(page);
            }
        },
        didTransition() {
            const ev = document.createEvent('HTMLEvents');
            ev.initEvent('ZoteroItemUpdated', true, true);
            document.dispatchEvent(ev);
        }
    }
});
