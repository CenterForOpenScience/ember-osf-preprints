import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default Component.extend({
    store: service(),
    preprint: null,
    submissions: null,
    isAllowSubmissions: false,
    isAdmin: false,
    isContributor: false,
    didReceiveAttrs() {
        this.get('fetchSubmissions').perform(this.get('preprint.id'));
    },
    fetchSubmissions: task(function* (preprintId) {
        const submissions = yield this.get('store').query('chronos-submission', { preprintId });
        this.set('submissions', submissions);
        const submittedOrRejectedSubmissions = submissions.filter((item) => {
            const status = item.get('status');
            return status === 'SUBMITTED' || status === 'PUBLISHED' || status === 'ACCEPTED';
        });
        if (submittedOrRejectedSubmissions.length > 0) {
            this.set('isAllowSubmissions', false);
        } else if (this.get('isAdmin') && this.get('preprint.reviewsState') === 'accepted' && (this.get('preprint.provider.reviewsWorkflow') === 'pre-moderation' || this.get('preprint.provider.reviewsWorkflow') === 'post-moderation')) {
            this.set('isAllowSubmissions', true);
        }
    }),
});
