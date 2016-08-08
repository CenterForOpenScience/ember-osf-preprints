import Ember from 'ember';

export default Ember.Route.extend({

    model() {
        return Ember.RSVP.hash({
//            preprints: this.store.findAll('preprint'),
            taxonomy: this.store.find('taxonomy', 1)
        });
    }

});
