import Ember from 'ember';
import config from 'ember-get-config';

export default Ember.Route.extend({
    theme: Ember.inject.service(),

    beforeModel(transition) {
        const {slug} = transition.params.provider;

        this.get('store')
            .findAll('preprint-provider')
            .then(data => {
                if (data.getEach('id').includes(slug)) {
                    this.set('theme.id', slug);
                } else {
                    this.set('theme.id', config.PREPRINTS.provider);

                    if (slug.length === 5) {
                        this.transitionTo('content', slug);
                    } else {
                        this.transitionTo('page-not-found');
                    }
                }
            });
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
