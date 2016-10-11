import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
    location: config.locationType,
    rootURL: config.rootURL,
});

Router.map(function() {
    this.route('preprints/submit');
    this.route('preprints/discover');
    this.route('content', { path: '/:preprint_id' });
    this.route('404', { path: 'preprints/*bad_url'});
    this.route('preprints/page-not-found');
});

export default Router;
