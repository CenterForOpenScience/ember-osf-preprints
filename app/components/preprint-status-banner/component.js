import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { task } from 'ember-concurrency';

const PENDING = 'pending';
const ACCEPTED = 'accepted';
const REJECTED = 'rejected';
const PENDING_WITHDRAWAL = 'pendingWithdrawal';
const WITHDRAWAL_REJECTED = 'withdrawalRejected';
const WITHDRAWN = 'withdrawn';

const PRE_MODERATION = 'pre-moderation';
const POST_MODERATION = 'post-moderation';

const ICONS = {
    [PENDING]: 'fa-hourglass-o',
    [ACCEPTED]: 'fa-check-circle-o',
    [REJECTED]: 'fa-times-circle-o',
    [PENDING_WITHDRAWAL]: 'fa-hourglass-o',
    [WITHDRAWAL_REJECTED]: 'fa-times-circle-o',
    [WITHDRAWN]: 'fa-exclamation-triangle',
};

const STATUS = {
    [PENDING]: 'components.preprint-status-banner.pending',
    [ACCEPTED]: 'components.preprint-status-banner.accepted',
    [REJECTED]: 'components.preprint-status-banner.rejected',
    [PENDING_WITHDRAWAL]: 'components.preprint-status-banner.pending_withdrawal',
    [WITHDRAWAL_REJECTED]: 'components.preprint-status-banner.withdrawal_rejected',
};

const MESSAGE = {
    [PRE_MODERATION]: 'components.preprint-status-banner.message.pending_pre',
    [POST_MODERATION]: 'components.preprint-status-banner.message.pending_post',
    [ACCEPTED]: 'components.preprint-status-banner.message.accepted',
    [REJECTED]: 'components.preprint-status-banner.message.rejected',
    [PENDING_WITHDRAWAL]: 'components.preprint-status-banner.message.pending_withdrawal',
    [WITHDRAWAL_REJECTED]: 'components.preprint-status-banner.message.withdrawal_rejected',
    [WITHDRAWN]: 'components.preprint-status-banner.message.withdrawn',
};

const WORKFLOW = {
    [PRE_MODERATION]: 'global.pre_moderation',
    [POST_MODERATION]: 'global.post_moderation',
};

const CLASS_NAMES = {
    [PRE_MODERATION]: 'preprint-status-pending-pre',
    [POST_MODERATION]: 'preprint-status-pending-post',
    [ACCEPTED]: 'preprint-status-accepted',
    [REJECTED]: 'preprint-status-rejected',
    [PENDING_WITHDRAWAL]: 'preprint-status-rejected',
    [WITHDRAWAL_REJECTED]: 'preprint-status-rejected',
    [WITHDRAWN]: 'preprint-status-withdrawn',
};

export default Component.extend({
    i18n: service(),
    theme: service(),

    isWithdrawn: false,
    isPendingWithdrawal: false,
    isWithdrawalRejected: false,

    // translations
    labelModeratorFeedback: 'components.preprint-status-banner.feedback.moderator_feedback',
    moderator: 'components.preprint-status-banner.feedback.moderator',
    baseMessage: 'components.preprint-status-banner.message.base',

    classNames: ['preprint-status-component'],
    classNameBindings: ['getClassName'],

    latestAction: null,

    reviewerComment: alias('latestAction.comment'),
    reviewerName: alias('latestAction.creator.fullName'),

    getClassName: computed('submission.{provider.reviewsWorkflow,reviewsState}', 'isPendingWithdrawal', 'isWithdrawn', 'isWithdrawalRejected', function() {
        if (this.get('isPendingWithdrawal')) {
            return CLASS_NAMES[PENDING_WITHDRAWAL];
        } else if (this.get('isWithdrawn')) {
            return CLASS_NAMES[WITHDRAWN];
        } else if (this.get('isWithdrawalRejected')) {
            return CLASS_NAMES[WITHDRAWAL_REJECTED];
        } else {
            return this.get('submission.reviewsState') === PENDING ?
                CLASS_NAMES[this.get('submission.provider.reviewsWorkflow')] :
                CLASS_NAMES[this.get('submission.reviewsState')];
        }
    }),

    bannerContent: computed('statusExplanation', 'workflow', 'theme.{isProvider,provider.name}', 'isPendingWithdrawal', 'isWithdrawn', 'isWithdrawalRejected', function() {
        const i18n = this.get('i18n');
        if (this.get('isPendingWithdrawal')) {
            return i18n.t(this.get('statusExplanation'), { documentType: this.get('submission.provider.documentType') });
        } else if (this.get('isWithdrawn')) {
            return i18n.t(MESSAGE[WITHDRAWN], { documentType: this.get('submission.provider.documentType') });
        } else if (this.get('isWithdrawalRejected')) {
            return i18n.t(MESSAGE[WITHDRAWAL_REJECTED], { documentType: this.get('submission.provider.documentType') });
        } else {
            const tName = this.get('theme.isProvider') ?
                this.get('theme.provider.name') :
                i18n.t('global.brand_name');
            const tWorkflow = i18n.t(this.get('workflow'));
            const tStatusExplanation = i18n.t(this.get('statusExplanation'));
            return `${i18n.t(this.get('baseMessage'), { name: tName, reviewsWorkflow: tWorkflow, documentType: this.get('submission.provider.documentType') })} ${tStatusExplanation}`;
        }
    }),

    feedbackBaseMessage: computed('isWithdrawalRejected', function () {
        const i18n = this.get('i18n');
        if (this.get('isWithdrawalRejected')) {
            return '';
        }
        return i18n.t('components.preprint-status-banner.feedback.base', { documentType: this.get('submission.provider.documentType') });
    }),

    statusExplanation: computed('submission.{provider.reviewsWorkflow,reviewsState}', 'isPendingWithdrawal', 'isWithdrawalRejected', function() {
        if (this.get('isPendingWithdrawal')) {
            return MESSAGE[PENDING_WITHDRAWAL];
        } else if (this.get('isWithdrawalRejected')) {
            return MESSAGE[WITHDRAWAL_REJECTED];
        } else {
            return this.get('submission.reviewsState') === PENDING ?
                MESSAGE[this.get('submission.provider.reviewsWorkflow')] :
                MESSAGE[this.get('submission.reviewsState')];
        }
    }),

    status: computed('submission.reviewsState', 'isPendingWithdrawal', 'isWithdrawalRejected', function() {
        let currentState = this.get('submission.reviewsState');
        if (this.get('isPendingWithdrawal')) {
            currentState = PENDING_WITHDRAWAL;
        } else if (this.get('isWithdrawalRejected')) {
            currentState = WITHDRAWAL_REJECTED;
        }
        return STATUS[currentState];
    }),

    icon: computed('submission.reviewsState', 'isPendingWithdrawal', 'isWithdrawn', 'isWithdrawalRejected', function() {
        let currentState = this.get('submission.reviewsState');
        if (this.get('isPendingWithdrawal')) {
            currentState = PENDING_WITHDRAWAL;
        } else if (this.get('isWithdrawalRejected')) {
            currentState = WITHDRAWAL_REJECTED;
        } else if (this.get('isWithdrawn')) {
            currentState = WITHDRAWN;
        }
        return ICONS[currentState];
    }),

    workflow: computed('submission.provider.reviewsWorkflow', function () {
        return WORKFLOW[this.get('submission.provider.reviewsWorkflow')];
    }),

    didReceiveAttrs() {
        this.get('_loadPreprintState').perform();
    },

    _loadPreprintState: task(function* () {
        if (this.get('isWithdrawn')) {
            return;
        }
        const submissionActions = yield this.get('submission.reviewActions');
        const latestSubmissionAction = submissionActions.get('firstObject');
        const withdrawalRequests = yield this.get('submission.requests');
        const withdrawalRequest = withdrawalRequests.get('firstObject');
        if (withdrawalRequest) {
            const requestActions = yield withdrawalRequest.get('actions');
            const latestRequestAction = requestActions.get('firstObject');
            if (latestRequestAction && latestRequestAction.get('actionTrigger') === 'reject') {
                this.set('isWithdrawalRejected', true);
                this.set('latestAction', latestRequestAction);
                return;
            } else {
                this.set('isPendingWithdrawal', true);
                return;
            }
        }
        if (this.get('submission.provider.reviewsCommentsPrivate')) {
            return;
        }
        this.set('latestAction', latestSubmissionAction);
    }),
});
