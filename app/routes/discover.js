import Ember from 'ember';

export default Ember.Route.extend({

    model() {
        return this.store.find('taxonomy', 1);
    }

});

