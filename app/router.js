import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
    location: config.locationType,
    rootURL: config.rootURL,
    metrics: Ember.inject.service(),

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
    this.route('index', {path: 'preprints'});
    this.route('submit', {path: 'preprints/submit'});
    this.route('discover', {path: 'preprints/discover'});
    this.route('content', { path: '/:preprint_id' });
    this.route('reroute-guid', { path: 'preprints/*bad_url'});
    this.route('page-not-found', {path: 'preprints/page-not-found'});
});

export default Router;
