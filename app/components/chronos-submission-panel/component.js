import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { A } from '@ember/array';

export default Component.extend({
    store: service(),
    toast: service(),
    isLoading: false,
    canLoadMore: false,
    page: 1,
    selectedJournal: null,
    keyword: '',
    preprint: null,
    journals: A(),

    actions: {
        getInitialJournals(keyword) {
            this.get('_fetchInitialJournals').perform(keyword);
        },
        getMoreJournals() {
            this.get('_fetchMoreJournals').perform();
        },
        journalSelected(journal) {
            this.set('selectedJournal', journal);
        },
        cancelSubmission() {
            this.set('journals', A());
            this.set('selectedJournal', null);
        },
    },
    _fetchInitialJournals: task(function* (keyword) {
        // Wait a bit for the user to finish typing.
        yield timeout(500);
        // Reset the list of journals
        this.set('journals', A());
        // Reset page number
        this.set('page', 1);
        this.set('isLoading', true);
        const journals = yield this.get('store').query('chronos-journal', { page: 1, 'filter[title]': keyword });
        this.set('isLoading', false);
        const canLoadMore = !(journals.get('meta.total_pages') === this.get('page'));
        // Set the keyword
        this.set('keyword', keyword);
        this.set('canLoadMore', canLoadMore);
        this.set('journals', journals);
    }).restartable(),
    _fetchMoreJournals: task(function* () {
        const journals = this.get('journals');
        const page = this.get('page');
        const keyword = this.get('keyword');
        this.set('isLoading', true);
        const moreJournals = yield this.get('store').query('chronos-journal', { page: page + 1, 'filter[title]': keyword });
        journals.pushObjects(moreJournals.toArray().map(item => item._internalModel));
        this.set('isLoading', false);
        const canLoadMore = page + 1 < journals.get('meta.total_pages');
        if (canLoadMore) {
            this.set('page', page + 1);
        }
        this.set('canLoadMore', canLoadMore);
    }).enqueue(),
    _submit: task(function* () {
        const submission = this.get('store').createRecord('chronos-submission', {
            journal: this.get('selectedJournal'),
            preprint: this.get('preprint'),
        });
        try {
            yield submission.save();
            window.open(submission.get('submissionUrl'));
            window.location.reload(true);
        } catch (e) {
            this.get('toast').error(e.errors[0].detail);
        }
    }).drop(),
});
