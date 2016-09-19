import Ember from 'ember';

export default Ember.Component.extend({
    provider: Ember.inject.service(),
    navbarTitle: Ember.computed('provider.provider', function() {
        return this.get('provider.provider.name') || 'OSF Preprints';
    })
});
