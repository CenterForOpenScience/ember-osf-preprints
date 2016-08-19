import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
    location: config.locationType,
    rootURL: config.rootURL
});

Router.map(function() {
    this.route('content', { path: '/content/:preprint_id' });

    this.route('submit');
    this.route('discover');
    this.route('page-not-found', { path: '/*wildcard' });
});

export default Router;
