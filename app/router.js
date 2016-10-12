import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
    location: config.locationType,
    rootURL: config.rootURL,
});

Router.map(function() {
    this.route('/', {path: 'preprints'});
    this.route('submit', {path: 'preprints/submit'});
    this.route('discover', {path: 'preprints/discover'});
    this.route('content', { path: '/:preprint_id' });
    this.route('page-not-found', { path: 'preprints/*bad_url'});
    this.route('page-not-found', {path: 'preprints/page-not-found'});
});

export default Router;
