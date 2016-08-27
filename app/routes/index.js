import Ember from 'ember';
import config from 'ember-get-config';
import resetScrollMixin from '../mixins/reset-scroll';

export default Ember.Route.extend(resetScrollMixin, {
    model() {
        var getTotalPayload = '{"size": 0, "from": 0,"query": {"bool": {"must": {"query_string": {"query": "*"}}, "filter": [{"term": {"type.raw": "preprint"}}]}}}';

        var sharePreprintsTotal = Ember.$.ajax({
                type: 'POST',
                url: config.SHARE.searchUrl,
                data: getTotalPayload,
                contentType: 'application/json',
                crossDomain: true,
            }).then(function (results) {
                return results.hits.total.toLocaleString();
            });

        return Ember.RSVP.hash({
            theDate: new Date(),
            subjects: this.store.query('taxonomy', { filter: { parents: 'null' }, page: { size: 20 } }),
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
