import Ember from 'ember';

export default Ember.Service.extend({
    id: null,

    isProvider: Ember.computed.bool('id'),

    stylesheet: Ember.computed('id', function() {
        return `/preprints/assets/css/${this.get('id').toLowerCase()}.css`;
    }),
});
