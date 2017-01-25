import Ember from 'ember';

export default Ember.Helper.extend({
    theme: Ember.inject.service(),

    onSubRouteChange: Ember.observer('theme.isSubRoute', function() {
        this.recompute();
    }),

    compute(params) {
        const route = params.join('');

        return this.get('theme.isSubRoute') ? `provider.${route}` : route;
    }
});
