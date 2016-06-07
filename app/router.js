import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
    this.route('preprints', function() {
        this.route('preprint', {
            path: '/:file_guid'
        });
    });
  //this.route('preprint', { path: '/preprints/:file_guid'});
  this.route('add-preprint', { path: '/add-preprint'});
  this.route('search');
  this.route('categories');
});

export default Router;
