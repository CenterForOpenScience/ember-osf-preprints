import Ember from 'ember';
import config from 'ember-get-config';

const getTotalPayload = '{"size": 0, "from": 0,"query": {"bool": {"must": {"query_string": {"query": "*"}}, "filter": [{"term": {"type.raw": "preprint"}}]}}}';

export default Ember.Controller.extend({
    sharePreprintsTotal: null,
    init() {
        // Fetch total number of preprints. Allow elasticsearch failure to pass silently.
        // This is considered to be a one-time fetch, and therefore is run in controller init.
        Ember.$.ajax({
            type: 'POST',
            url: config.SHARE.searchUrl,
            data: getTotalPayload,
            contentType: 'application/json',
            crossDomain: true,
        }).then(results => results.hits.total.toLocaleString())
          .then(count => this.set('sharePreprintsTotal', count))
          .fail(() => {});
    }

});
