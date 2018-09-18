import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default Component.extend({
    store: service(),
    preprintId: null,
    submissions: null,
    didReceiveAttrs() {
        this.get('fetchSubmissions').perform(this.get('preprintId'));
    },
    fetchSubmissions: task(function* (preprintId) {
        const submissions = yield this.get('store').query('chronos-submission', { preprintId });
        this.set('submissions', submissions);
    }),
});
