import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
    location: config.locationType,
    rootURL: config.rootURL
});

Router.map(function() {
    this.route('preprints', { path: '/preprints/:file_id' }, function() {
        this.route('view', { path: '/' });
        this.route('edit', { path: '/edit' });
    });

    this.route('add-preprint', { path: '/preprints/add' });

    this.route('discover');

    this.route('page-not-found', { path: '/*wildcard' });
});

export default Router;
