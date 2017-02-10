import Ember from 'ember';
import config from 'ember-get-config';
import Analytics from '../mixins/analytics';

/**
 * @module ember-preprints
 * @submodule controllers
 */

/**
 * @class Index Controller
 */
export default Ember.Controller.extend(Analytics, {
    theme: Ember.inject.service(),
    sharePreprintsTotal: null,
    init() {
        // Fetch total number of preprints. Allow elasticsearch failure to pass silently.
        // This is considered to be a one-time fetch, and therefore is run in controller init.
        const filter = [
            {
                term: {
                    types: 'preprint'
                }
            }
        ];

        const getTotalPayload = {
            size: 0,
            from: 0,
            query: {
                bool: {
                    must: {
                        query_string: {
                            query: '*'
                        }
                    },
                    filter
                }
            }
        };

        if (this.get('theme.isProvider')) {
            filter.push({
                term: {
                    // TODO filter by name and use sources.raw (potential conflicts later), Needs API name to match SHARE source.
                    // Update: .raw has been removed from type and source queries.
                    sources: this.get('theme.id')
                }
            });
        }

        Ember.$.ajax({
            type: 'POST',
            url: config.SHARE.searchUrl,
            data: JSON.stringify(getTotalPayload),
            contentType: 'application/json',
            crossDomain: true,
        })
          .then(results => this.set('sharePreprintsTotal', results.hits.total));

        this.set('currentDate', new Date());
    },

    actions: {
        contactLink(href, category, action, label) {
            const metrics = Ember.get(this, 'metrics');

            // TODO submit PR to ember-metrics for a trackSocial function for Google Analytics. For now, we'll use trackEvent.
            metrics.trackEvent({
                category,
                action,
                label
            });

            if (label.includes('email'))
              return;

            window.open(href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=600,height=400');
            return false;
        }
    }
});
