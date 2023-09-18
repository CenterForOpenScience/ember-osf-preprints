import RSVP from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import config from 'ember-get-config';
import Analytics from 'ember-osf/mixins/analytics';

import ResetScrollMixin from '../mixins/reset-scroll';
/**
 * @module ember-preprints
 * @submodule routes
 */

/**
 * Loads all disciplines and preprint providers to the index page
 * @class Index Route Handler
 */
export default Route.extend(Analytics, ResetScrollMixin, {
    store: service(),
    theme: service(),
    model() {
        return RSVP.hash({
            taxonomies: this.get('theme.provider')
                .then(provider => provider
                    .queryHasMany('highlightedTaxonomies', {
                        page: {
                            size: 20,
                        },
                    })),
            brandedProviders: this.get('theme.isProvider')
                ? []
                : this.store
                    .findAll('preprint-provider', { reload: true })
                    .then(result => result
                        .filter(item => item.id !== 'osf')),
        });
    },
    actions: {
        search(q) {
            // remove trailing slash if it exists
            const host = this.host.replace(/\/$/, '');
            if (this.get('theme.isSubRoute')) {
                const { id } = this.get('theme');
                window.location.href = `${host}/preprints/${id}/discover?q=${q}`;
            } else {
                window.location.href = `${host}/search?q=${q}&resourceType=Preprint`;
            }
        },
    },
    host: config.OSF.url,
});
