import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';

const PENDING = 'pending';
const ACCEPTED = 'accepted';
const REJECTED = 'rejected';
const WITHDRAWN = 'withdrawn';

const PRE_MODERATION = 'pre-moderation';
const POST_MODERATION = 'post-moderation';

const ICONS = {
    [PENDING]: 'fa-hourglass-o',
    [ACCEPTED]: 'fa-check-circle-o',
    [REJECTED]: 'fa-times-circle-o',
    [WITHDRAWN]: 'fa-exclamation-triangle',
};

const STATUS = {
    [PENDING]: 'components.preprint-status-banner.pending',
    [ACCEPTED]: 'components.preprint-status-banner.accepted',
    [REJECTED]: 'components.preprint-status-banner.rejected',
};

const MESSAGE = {
    [PRE_MODERATION]: 'components.preprint-status-banner.message.pending_pre',
    [POST_MODERATION]: 'components.preprint-status-banner.message.pending_post',
    [ACCEPTED]: 'components.preprint-status-banner.message.accepted',
    [REJECTED]: 'components.preprint-status-banner.message.rejected',
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
    [WITHDRAWN]: 'preprint-status-withdrawn',
};

export default Component.extend({
    i18n: service(),
    theme: service(),

    isWithdrawn: false,

    // translations
    labelModeratorFeedback: 'components.preprint-status-banner.feedback.moderator_feedback',
    moderator: 'components.preprint-status-banner.feedback.moderator',
    feedbackBaseMessage: 'components.preprint-status-banner.feedback.base',
    baseMessage: 'components.preprint-status-banner.message.base',

    classNames: ['preprint-status-component'],
    classNameBindings: ['getClassName'],

    latestAction: null,

    reviewerComment: alias('latestAction.comment'),
    reviewerName: alias('latestAction.creator.fullName'),

    getClassName: computed('submission.{provider.reviewsWorkflow,reviewsState}', function() {
        if (this.get('isWithdrawn')) {
            return CLASS_NAMES[WITHDRAWN];
        } else {
            return this.get('submission.reviewsState') === PENDING ?
                CLASS_NAMES[this.get('submission.provider.reviewsWorkflow')] :
                CLASS_NAMES[this.get('submission.reviewsState')];
        }
    }),

    bannerContent: computed('statusExplanation', 'workflow', 'theme.{isProvider,provider.name}', 'isWithdrawn', function() {
        const i18n = this.get('i18n');
        if (this.get('isWithdrawn')) {
            return i18n.t(MESSAGE[WITHDRAWN]);
        } else {
            const tName = this.get('theme.isProvider') ?
                this.get('theme.provider.name') :
                i18n.t('global.brand_name');

            const tWorkflow = i18n.t(this.get('workflow'));
            const tStatusExplanation = i18n.t(this.get('statusExplanation'));
            return `${i18n.t(this.get('baseMessage'), { name: tName, reviewsWorkflow: tWorkflow, documentType: this.get('submission.provider.documentType') })} ${tStatusExplanation}.`;
        }
    }),

    statusExplanation: computed('submission.{provider.reviewsWorkflow,reviewsState}', function() {
        return this.get('submission.reviewsState') === PENDING ?
            MESSAGE[this.get('submission.provider.reviewsWorkflow')] :
            MESSAGE[this.get('submission.reviewsState')];
    }),

    status: computed('submission.reviewsState', function() {
        return STATUS[this.get('submission.reviewsState')];
    }),

    icon: computed('submission.reviewsState', 'isWithdrawn', function() {
        if (this.get('isWithdrawn')) {
            return ICONS[WITHDRAWN];
        } else {
            return ICONS[this.get('submission.reviewsState')];
        }
    }),

    workflow: computed('submission.provider.reviewsWorkflow', function () {
        return WORKFLOW[this.get('submission.provider.reviewsWorkflow')];
    }),

    didReceiveAttrs() {
        if (this.get('submission.provider.reviewsCommentsPrivate')) {
            this.set('latestAction', null);
        } else {
            const submissionActions = this.get('submission.reviewActions');
            if (submissionActions) {
                submissionActions.then((reviewActions) => {
                    if (reviewActions.length) {
                        this.set('latestAction', reviewActions.get('firstObject'));
                    } else {
                        this.set('latestAction', null);
                    }
                });
            } else {
                this.set('latestAction', null);
            }
        }
    },

});
