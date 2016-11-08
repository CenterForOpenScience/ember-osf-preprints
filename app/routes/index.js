import Ember from 'ember';

import ResetScrollMixin from '../mixins/reset-scroll';
import Analytics from '../mixins/analytics';

export default Ember.Route.extend(Analytics, ResetScrollMixin, {
    theme: Ember.inject.service(),
    model() {
        const hash = {
            taxonomies: this.store
                .query('taxonomy', {
                    filter: {
                        parents: 'null'
                    },
                    page: {
                        size: 20
                    }
                }
            ),
            brandedProviders: this
                .get('store')
                .findAll('preprint-provider', { reload: true })
                .then(result => result
                    .filter(item => item.id !== 'osf')
                )
        };

        const acceptableSubjects = this.get('theme.provider.subjectsAcceptable');

        if (!this.get('theme.isProvider') || !acceptableSubjects.length)
            return Ember.RSVP.hash(hash);

        const topLevelAcceptableSubjects = acceptableSubjects
            .map(subject => subject[0][0]);

        hash.taxonomies = hash.taxonomies
            .then(records => records
                .filter(item => topLevelAcceptableSubjects.includes(item.id))
            );

        return Ember.RSVP.hash(hash);
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
