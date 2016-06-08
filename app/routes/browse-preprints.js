import Ember from 'ember';

export default Ember.Route.extend({
    model() {
        return {
            preprints: this.store.findAll('preprint'),
            subjects: this.store.findAll('subject')
        };
    },

    actions: {
        filter: function(subject) {
            alert(subject);
            for (var preprint in this.store.findAll('preprint')) {
                alert(preprint.get('subject'));
            }
        }
    }
});
