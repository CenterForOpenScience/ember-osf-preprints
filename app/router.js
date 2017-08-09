import Ember from 'ember';
import config from 'ember-get-config';

const Router = Ember.Router.extend({
    location: config.locationType,
    rootURL: config.rootURL,
    metrics: Ember.inject.service(),
    store: Ember.inject.service(),
    theme: Ember.inject.service(),

    init() {
        this._super(...arguments);

        // Set the provider ID from the current origin
        if (window.isProviderDomain) {
            return this.get('store')
                .query('preprint-provider', {
                    filter: {
                        domain: `${window.location.origin}/`,
                    }
                })
                .then(providers => {
                    if (providers.length) {
                        this.set('theme.id', providers.objectAt(0).get('id'));
                    }
                });
        }
    },

    didTransition() {
        this._super(...arguments);
        this._trackPage();
    },

    _trackPage() {
        Ember.run.scheduleOnce('afterRender', this, () => {
            const page = document.location.pathname;
            const title = this.getWithDefault('currentRouteName', 'unknown');

            Ember.get(this, 'metrics').trackPage({ page, title });
            this.set('theme.currentLocation', window.location.href);
        });
    }
});

Router.map(function() {
    this.route('page-not-found', {path: '/*bad_url'});

    if (window.isProviderDomain) {
        this.route('index', {path: '/'});
        this.route('submit');
        this.route('discover');
        this.route('page-not-found');
        this.route('forbidden');
        this.route('resource-deleted');
    } else {
        this.route('index', {path: 'preprints'});
        this.route('submit', {path: 'preprints/submit'});
        this.route('discover', {path: 'preprints/discover'});
        this.route('provider', {path: 'preprints/:slug'}, function () {
            this.route('content', {path: '/:preprint_id'}, function() {
                this.route('edit');
            });
            this.route('discover');
            this.route('submit');
        });
        this.route('page-not-found', {path: 'preprints/page-not-found'});
        this.route('forbidden', {path: 'preprints/forbidden'});
        this.route('resource-deleted', {path: 'preprints/resource-deleted'});
    }

    this.route('content', {path: '/:preprint_id'}, function() {
        this.route('edit');
    });
});

export default Router;
