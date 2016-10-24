import Ember from 'ember';

import ResetScrollMixin from '../mixins/reset-scroll';
import Analytics from '../mixins/analytics';

export default Ember.Route.extend(Analytics, ResetScrollMixin, {
    theme: Ember.inject.service(),
    model() {
        // taxonomy for the model rather than all
        // model = this.get('provider')
        // model.get('taxonomies')
        // this.store.get('provider.taxonomies', {filter: {parents: null}});
        return this.store.query('taxonomy', { filter: { parents: 'null' }, page: { size: 20 } });
    },
    actions: {
        search(q) {
            let route = 'discover';

            if (this.get('theme.isProvider'))
                route = `provider.${route}`;

            this.transitionTo(route, { queryParams: { queryString: q } });
        }
    }
});
