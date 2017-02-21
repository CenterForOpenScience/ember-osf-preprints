import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';
import SetupSubmitControllerMixin from '../mixins/setup-submit-controller';
import Analytics from 'ember-osf/mixins/analytics';
import config from 'ember-get-config';
import loadAll from 'ember-osf/utils/load-relationship';
import permissions from 'ember-osf/const/permissions';

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
    queryParams: {
        edit: {
            refreshModel: true // if queryParam, do a full transition
        }
    },
    setup() {
        // Overrides setup method.  If query param /?edit is present, uses 'submit' controller instead.
        this.set('controllerName', this.get('editMode') ? 'submit' : 'content');
        return this._super(...arguments);
    },
    renderTemplate() {
        // Overrides renderTemplate method.  If query param /?edit is present, uses 'submit' template instead.
        this.render(this.get('editMode') ? 'submit' : 'content');
    },
    model(params) {
        if (params.edit)
            this.set('editMode', true);

        return this
            .store
            .findRecord('preprint', params.preprint_id);
    },
    setupController(controller, model) {
        if (this.get('editMode')) {
            // Runs setupController for 'submit'
            this.setupSubmitController(controller, model);
        } else {
            // Runs setupController for 'content'
            controller.set('activeFile', model.get('primaryFile'));
            controller.set('node', this.get('node'));
            Ember.run.scheduleOnce('afterRender', this, function() {
                MathJax.Hub.Queue(['Typeset', MathJax.Hub, [Ember.$('.abstract')[0], Ember.$('#preprintTitle')[0]]]);  // jshint ignore:line
            });
        }

        return this._super(...arguments);
    },
    afterModel(preprint) {
        this._super(...arguments);
        const {origin, search} = window.location;
        let contributors = Ember.A();

        return preprint.get('provider')
            .then(provider => {
                const providerId = provider.get('id');
                const themeId = this.get('theme.id');
                const isOSF = providerId === 'osf';

                // If we're on the proper branded site, stay here.
                if ((!themeId && isOSF) || themeId === providerId)
                    return Promise.all([
                        provider,
                        preprint.get('node')
                    ]);

                // Otherwise, redirect to the proper branded site.
                // Hard redirect instead of transition, in anticipation of Phase 2 where providers will have their own domains.
                const urlParts = [
                    origin
                ];

                if (!isOSF)
                    urlParts.push('preprints', providerId);

                urlParts.push(preprint.get('id'), search);

                const url = urlParts.join('/');

                window.history.replaceState({}, document.title, url);
                window.location.replace(url);

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
                    preprint.get('primaryFile'),
                    loadAll(node, 'contributors', contributors)
                ]);
            })
            .then(([provider, node, license, primaryFile]) => {
                const title = node.get('title');
                const description = node.get('description');
                const doi = preprint.get('doi');
                const image = this.get('theme.logoSharing');
                const imageUrl = `${origin.replace(/^https/, 'http')}${image.path}`;
                const dateCreated = new Date(preprint.get('dateCreated') || null);
                const dateModified = new Date(preprint.get('dateModified') || dateCreated);
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
                const highwirePress = [
                    ['citation_title', title],
                    ['citation_description', description],
                    ['citation_public_url', canonicalUrl],
                    ['citation_publication_date', `${dateCreated.getFullYear()}/${dateCreated.getMonth() + 1}/${dateCreated.getDate()}`],
                    ['citation_doi', doi]
                ];

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
                    ['dc.identifier', doi]
                ];

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
                    const givenName = contributor.get('users.givenName');
                    const familyName = contributor.get('users.familyName');
                    const fullName = contributor.get('users.fullName');

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
                    ['dc.license', license.get('name')]
                );

                if (/\.pdf$/.test(primaryFile.get('name'))) {
                    highwirePress.push(['citation_pdf_url', primaryFile.get('links').download]);
                }

                const headTags = [
                    openGraph,
                    highwirePress,
                    eprints,
                    bePress,
                    prism,
                    dublinCore
                ]
                    .reduce((a, b) => a.concat(b), [])
                    .filter(item => item[1]) // Don't show tags with no content
                    .map(item => ({
                        type: 'meta',
                        attrs: {
                            property: item[0],
                            content: item[1]
                        }
                    }));

                this.set('headTags', headTags);
                this.get('headTagsService').collectHeadTags();
            });
    },
    actions: {
        error(error) {
            // Handle API Errors
            if (error && error.errors && Ember.isArray(error.errors)) {
                const {detail} = error.errors[0];
                const page = handlers.get(detail) || 'page-not-found';

                return this.intermediateTransitionTo(page);
            }
        }
    }
});
