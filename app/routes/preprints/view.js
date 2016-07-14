import Ember from 'ember';
import config from 'ember-get-config';
import $ from 'jquery';

export default Ember.Route.extend({
    model(params) {
        return this.modelFor('preprints');
    }
});

