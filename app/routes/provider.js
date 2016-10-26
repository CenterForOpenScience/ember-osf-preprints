import Ember from 'ember';

export default Ember.Route.extend({
    theme: Ember.inject.service(),

    init() {
        this.get('store')
            .findAll('preprint-provider', { reload: true })
            .then(data => this.set('providers', data.getEach('id')));
    },

    beforeModel(transition) {
        const {slug} = transition.params.provider;

        if (this.get('providers').includes(slug)) {
            this.set('theme.id', slug);
        } else {
            this.set('theme.id', null);
            this.transitionTo('content', slug);
        }
    },

    model(params) {
        return this.get('store')
            .findRecord('preprint-provider', params.slug);
    },

    actions: {
        error(error) {

            // Manage your errors
            Ember.onerror(error);

            // substate implementation when returning `true`
            return true;

        }
    }
});
