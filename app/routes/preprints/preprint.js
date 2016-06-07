import Ember from 'ember';

export default Ember.Route.extend({
    model(preprintId) {
        console.log(preprintId);
        return this.store.findRecord('preprint', preprintId.file_guid);
    }
});
