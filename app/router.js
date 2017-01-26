import Ember from 'ember';
import config from 'ember-get-config';

const {hostname} = window.location;

const provider = config
    .PREPRINTS
    .providers
    // Exclude OSF
    .slice(1)
    // Filter out providers without a domain
    .filter(p => p.domain)
    .find(p =>
        // Check if the hostname includes: the domain, the domain with dashes instead of periods, or just the id
        hostname.includes(p.domain) ||
        hostname.includes(p.domain.replace(/\./g, '-')) ||
        hostname.includes(p.id)
    );

const Router = Ember.Router.extend({
    location: config.locationType,
    rootURL: config.rootURL,
    metrics: Ember.inject.service(),
    theme: Ember.inject.service(),

    init() {
        this._super(...arguments);

        if (provider) {
            this.set('theme.id', provider.id);
            this.set('theme.isDomain', true);
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
        });
    }
});

Router.map(function() {
    this.route('page-not-found', {path: '/*bad_url'});

    if (provider) {
        this.route('index', {path: '/'});
        this.route('submit');
        this.route('discover');
        this.route('page-not-found');
    } else {
        this.route('index', {path: 'preprints'});
        this.route('submit', {path: 'preprints/submit'});
        this.route('discover', {path: 'preprints/discover'});
        this.route('provider', {path: 'preprints/:slug'}, function () {
            this.route('content', {path: '/:preprint_id'});
            this.route('discover');
            this.route('submit');
        });
        this.route('page-not-found', {path: 'preprints/page-not-found'});
    }

    this.route('content', {path: '/:preprint_id'});
    this.route('forbidden');
    this.route('resource-deleted');
});

export default Router;
