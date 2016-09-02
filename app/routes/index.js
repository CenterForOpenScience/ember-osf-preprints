import Ember from 'ember';
import config from 'ember-get-config';
import ResetScrollMixin from '../mixins/reset-scroll';

const getTotalPayload = '{"size": 0, "from": 0,"query": {"bool": {"must": {"query_string": {"query": "*"}}, "filter": [{"term": {"type.raw": "preprint"}}]}}}';

export default Ember.Route.extend(ResetScrollMixin, {
    model() {
        return this.store.query('taxonomy', { filter: { parents: 'null' }, page: { size: 20 } });
    },
    setupController(controller, model) {
        this._super(controller, model);
        controller.set('currentDate', new Date());

        // Fetch total number of preprints. Allow elasticsearch failure to pass silently.
        Ember.$.ajax({
            type: 'POST',
            url: config.SHARE.searchUrl,
            data: getTotalPayload,
            contentType: 'application/json',
            crossDomain: true,
        }).then(results => results.hits.total.toLocaleString())
          .then(count => controller.set('sharePreprintsTotal', count))
          .fail(() => {});
    },
    actions: {
        search(q) {
            this.transitionTo('discover', { queryParams: { queryString: q } });
        }
    }
});
