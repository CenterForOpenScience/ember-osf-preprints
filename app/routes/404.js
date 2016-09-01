import Ember from 'ember';

export default Ember.Route.extend({
    beforeModel() {
        this.intermediateTransitionTo('page-not-found');
    }
});
