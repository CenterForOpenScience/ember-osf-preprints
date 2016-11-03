import Ember from 'ember';

export default Ember.Route.extend({
    beforeModel(transition) {
        const {state, targetName} = transition;
        const slug = state.params[targetName].bad_url.replace(/\/.*$/, '');

        if (slug.length === 5) {
            window.location.href = `${window.location.origin}/${slug}`;
        } else {
            this.transitionTo('page-not-found');
        }
    }
});
