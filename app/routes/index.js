import Ember from 'ember';
import config from 'ember-get-config';

export default Ember.Route.extend({

    fileManager: Ember.inject.service(),
    model() {
        var getTotalPayload = '{"size": 0, "from": 0,"query": {"bool": {"must": {"query_string": {"query": "*"}}, "filter": [{"term": {"type.raw": "preprint"}}]}}}';

        var sharePreprintsTotal = Ember.$.ajax({
                type: 'POST',
                url: config.SHARE.searchUrl,
                data: getTotalPayload,
                contentType: 'application/json',
                crossDomain: true,
            }).then(function (results) {
                return results.hits.total;
            });

        return Ember.RSVP.hash({
            theDate: new Date(),
            subjects: this.store.query('taxonomy', { filter: { parents: 'null' }, page: { size: 20 } }),
            preprints: this.store.findRecord('preprint-provider', config.PREPRINTS.provider).then(provider => provider.get('preprints')),
            sharePreprintsTotal: sharePreprintsTotal
        });
    },
    actions: {
        // TODO: properly transfer subject to discover route
        goToSubject(sub) {
            this.transitionTo('discover', { queryParams: { subject: sub } });
        },
        search(q) {
            this.transitionTo('discover', { queryParams: { queryString: q } });
        }
    }
});
