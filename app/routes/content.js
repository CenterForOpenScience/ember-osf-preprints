import Ember from 'ember';
import ResetScrollMixin from '../mixins/reset-scroll';
import SetupSubmitControllerMixin from '../mixins/setup-submit-controller';
import Analytics from '../mixins/analytics';
import config from 'ember-get-config';
import loadAll from 'ember-osf/utils/load-relationship';
import permissions from 'ember-osf/const/permissions';

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

                // Otherwise, redirect to the branded page
                // Hard redirect instead of transition, in anticipation of Phase 2 where providers will have their own domains.
                const {origin, search} = window.location;

                const urlParts = [
                    origin
                ];

                if (!isOSF)
                    urlParts.push('preprints', providerId);

                urlParts.push(preprint.get('id'), search);

                const url = urlParts.join('/');

                window.history.replaceState({}, document.title, url);
                window.location.replace(url);
            });

        return preprint.get('node').then(node => {
            this.set('node', node);
            if (this.get('editMode')) {
                let userPermissions = this.get('node.currentUserPermissions') || [];
                if (userPermissions.indexOf(permissions.ADMIN) === -1) {
                    this.replaceWith('forbidden'); // Non-admin trying to access edit form.
                }
            }

            const ogp = [
                ['fb:app_id', config.FB_APP_ID],
                ['og:title', node.get('title')],
                ['og:image', `${window.location.protocol}//osf.io/static/img/circle_logo.png`],
                ['og:image:type', 'image/png'],
                ['og:url', window.location.href],
                ['og:description', node.get('description')],
                ['og:site_name', 'Open Science Framework'],
                ['og:type', 'article'],
                ['article:published_time', new Date(preprint.get('dateCreated')).toISOString()],
                ['article:modified_time', new Date(node.get('dateModified')).toISOString()]
            ];

            const tags = [
                ...preprint.get('subjects').map(subjectBlock => subjectBlock.map(subject => subject.text)),
                ...node.get('tags')
            ];

            for (let tag of tags)
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
        error(error, transition) {
            const slug = transition.params[transition.targetName].preprint_id;

            if (slug.length === 5) {
                window.location.href = [
                    window.location.origin,
                    slug
                ].join('/');
            } else {
                const path = ['', 'preprints'];

                if (this.get('theme.isProvider'))
                    path.push(this.get('theme.id'));

                path.push(slug);

                window.history.replaceState({}, 'preprints', path.join('/'));
                this.intermediateTransitionTo('page-not-found');
            }
        }
    }
});
