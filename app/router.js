import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  //TODO: Add nesting for viewing, editing, adding, and possibly adding a preprint
  //TODO: HBS code needs to be refactored here to make the "edit" page work
  this.route('preprints', { path: '/preprints/:file_id'}, function(){
        this.route('edit', { path: '/edit'});
  });


  this.route('add-preprint', { path: '/preprints/add'});

  this.route('browse');


  this.route('page-not-found', { path: '/*wildcard' });
});

export default Router;
