import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {

//  this.route('preprints', function(){
//    this.route('view', { path: '/:file_id' });
//  });

  this.route('preprints', { path: '/preprints/:file_id'});
  this.route('add-preprint', { path: '/add-preprint'});
  this.route('browse-preprints', { path: '/browse'});
  this.route('search');
  this.route('categories');
  this.route('login');
});

export default Router;
