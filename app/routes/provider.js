import Ember from 'ember';
import config from 'ember-get-config';

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
            this.set('theme.id', config.PREPRINTS.provider);

            if (slug.length === 5) {
                this.transitionTo('content', slug);
            } else {
                this.transitionTo('page-not-found');
            }
        }
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
