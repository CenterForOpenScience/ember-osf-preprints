import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
// import { task } from 'ember-concurrency';

const DRAFTED = 'DRAFT';
const SUBMITTED = 'SUBMITTED';
const ACCEPTED = 'ACCEPTED';
const REJECTED = 'CANCELLED';
const PUBLISHED = 'PUBLISHED';

const STATUS_ICON = {
    [DRAFTED]: 'fa-file-text-o',
    [SUBMITTED]: 'fa-hourglass-o',
    [ACCEPTED]: 'fa-check-circle-o',
    [REJECTED]: 'fa-times-circle-o',
    [PUBLISHED]: 'fa-book',
};

const ICON_CLASS = {
    [DRAFTED]: 'chronos-status-drafted',
    [SUBMITTED]: 'chronos-status-submitted',
    [ACCEPTED]: 'chronos-status-accepted',
    [REJECTED]: 'chronos-status-rejected',
    [PUBLISHED]: 'chronos-status-published',
};

const STATUS_LANGUAGE = {
    [DRAFTED]: 'components.chronos-submission-status-list-row.drafted',
    [SUBMITTED]: 'components.chronos-submission-status-list-row.submitted',
    [ACCEPTED]: 'components.chronos-submission-status-list-row.accepted',
    [REJECTED]: 'components.chronos-submission-status-list-row.rejected',
    [PUBLISHED]: 'components.chronos-submission-status-list-row.published',
};


export default Component.extend({
    i18n: service(),
    submission: null,
    isContributor: false,
    statusIcon: computed('submission.status', function () {
        return STATUS_ICON[this.get('submission.status')];
    }),
    statusIconClass: computed('submission.status', function () {
        return ICON_CLASS[this.get('submission.status')];
    }),
    statusLanguage: computed('submission.{status,journal.title}', function () {
        return this.get('i18n').t(STATUS_LANGUAGE[this.get('submission.status')], { title: this.get('submission.journal.title') });
    }),
});
