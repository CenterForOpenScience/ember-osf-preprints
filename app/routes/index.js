import Ember from 'ember';

import ResetScrollMixin from '../mixins/reset-scroll';
import Analytics from '../mixins/analytics';

export default Ember.Route.extend(Analytics, ResetScrollMixin, {
    theme: Ember.inject.service(),
    model() {
        const taxonomies = this.store
            .query('taxonomy', {
                filter: {
                    parents: 'null'
                },
                page: {
                    size: 20
                }
            });

        if (this.get('theme.isProvider')) {
            const acceptableSubjects = this.get('theme.provider.subjectsAcceptable');

            if (!acceptableSubjects.length)
                return taxonomies;

            const topLevelAcceptableSubjects = acceptableSubjects
                .map(subject => subject[0][0]);

            return taxonomies
                .then(records => records
                    .filter(item => topLevelAcceptableSubjects.includes(item.id))
                );
        }

        return taxonomies;
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
