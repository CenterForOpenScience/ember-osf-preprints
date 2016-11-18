import Ember from 'ember';
import config from 'ember-get-config';

export default Ember.Route.extend({
    theme: Ember.inject.service(),

    providerIds: config.PREPRINTS.providers.map(provider => provider.id),

    beforeModel(transition) {
        const {slug} = transition.params.provider;

        if (this.get('providerIds').includes(slug)) {
            this.set('theme.id', slug);
        } else {
            this.set('theme.id', config.PREPRINTS.provider);

            if (slug.length === 5) {
                this.transitionTo('content', slug);
            } else {
                this.replaceWith('page-not-found');
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
