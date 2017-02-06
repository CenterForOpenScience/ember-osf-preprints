import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';
import SetupSubmitControllerMixin from '../mixins/setup-submit-controller';
import Analytics from '../mixins/analytics';
import config from 'ember-get-config';
import loadAll from 'ember-osf/utils/load-relationship';
import permissions from 'ember-osf/const/permissions';
import getRedirectUrl from '../utils/get-redirect-url';

const providers = config.PREPRINTS.providers;

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
        // Redirect if necessary
        preprint.get('provider')
            .then(provider => {
                const providerId = provider.get('id');
                const themeId = this.get('theme.id');
                const isOSF = providerId === 'osf';

                // If we're on the proper branded site, stay there.
                if ((!themeId && isOSF) || themeId === providerId)
                    return;

                // Otherwise, find the correct provider and redirect
                const configProvider = providers.find(p => p.id === providerId);

                if (!configProvider)
                    throw new Error('Provider is not configured properly. Check the Ember configuration.');

                const {domain} = configProvider;
                const {origin, search} = window.location;
                const urlParts = [];

                // Provider with a domain
                if (this.get('theme.isDomain') || domain) {
                    urlParts.push(getRedirectUrl(window.location, domain));
                // Provider without a domain
                } else {
                    urlParts.push(origin);

                    if (!isOSF)
                        urlParts.push('preprints', providerId);

                    urlParts.push(preprint.get('id'));
                }

                urlParts.push(search);
                const url = urlParts.join('/').replace(/\/\/$/, '/');
                window.location.replace(url);
            });

        return preprint.get('node').then(node => {
            this.set('node', node);

            if (this.get('editMode')) {
                const userPermissions = this.get('node.currentUserPermissions') || [];

                if (!userPermissions.includes(permissions.ADMIN)) {
                    this.replaceWith('forbidden'); // Non-admin trying to access edit form.
                }
            }

            const {origin} = window.location;
            const image = this.get('theme.logoSharing');
            const imageUrl = `${origin.replace(/^https/, 'http')}${image.path}`;

            const ogp = [
                ['fb:app_id', config.FB_APP_ID],
                ['og:title', node.get('title')],
                ['og:image', imageUrl],
                ['og:image:secure_url', `${origin}${image.path}`], // We should always be on https in staging/prod
                ['og:image:width', image.width.toString()],
                ['og:image:height', image.height.toString()],
                ['og:image:type', image.type],
                ['og:url', window.location.href],
                ['og:description', node.get('description')],
                ['og:site_name', this.get('theme.provider.name')],
                ['og:type', 'article'],
                ['article:published_time', new Date(preprint.get('datePublished') || null).toISOString()]
            ];

            const modified = preprint.get('dateModified') || preprint.get('datePublished') || null;

            if (modified)
                ogp.push(['article:modified_time', new Date(modified).toISOString()]);

            const tags = [
                ...preprint.get('subjects').map(subjectBlock => subjectBlock.map(subject => subject.text)),
                ...node.get('tags')
            ];

            for (const tag of tags)
                ogp.push(['article:tag', tag]);

            let contributors = Ember.A();

            loadAll(node, 'contributors', contributors).then(() => {
                contributors.forEach(contributor => {
                    ogp.push(
                        ['og:type', 'article:author'],
                        ['profile:first_name', contributor.get('users.givenName')],
                        ['profile:last_name', contributor.get('users.familyName')]
                    );
                });

                this.set('headTags', ogp.map(item => (
                    {
                        type: 'meta',
                        attrs: {
                            property: item[0],
                            content: item[1]
                        }
                    }
                )));

                this.get('headTagsService').collectHeadTags();
            });
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
