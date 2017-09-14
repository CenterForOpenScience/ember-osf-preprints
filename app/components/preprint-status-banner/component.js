import Ember from 'ember';

const PENDING = 'pending';
const ACCEPTED = 'accepted';
const REJECTED = 'rejected';

const PRE_MODERATION = 'pre-moderation';
const POST_MODERATION = 'post-moderation';

const ICONS = {
    [PENDING]: 'fa-hourglass-o',
    [ACCEPTED]: 'fa-check-circle-o',
    [REJECTED]: 'fa-times-circle-o'
};

const STATUS = {
    [PENDING]: 'components.preprint-status-banner.pending',
    [ACCEPTED]: 'components.preprint-status-banner.accepted',
    [REJECTED]: 'components.preprint-status-banner.rejected'
};

const MESSAGE = {
    [PRE_MODERATION]: 'components.preprint-status-banner.message.pending_pre',
    [POST_MODERATION]: 'components.preprint-status-banner.message.pending_post',
    [ACCEPTED]: 'components.preprint-status-banner.message.accepted',
    [REJECTED]: 'components.preprint-status-banner.message.rejected'
};

const WORKFLOW = {
    [PRE_MODERATION]: 'global.pre_moderation',
    [POST_MODERATION]: 'global.post_moderation'
};

const CLASS_NAMES = {
    [PRE_MODERATION]: 'preprint-status-pending-pre',
    [POST_MODERATION]: 'preprint-status-pending-post',
    [ACCEPTED]: 'preprint-status-accepted',
    [REJECTED]: 'preprint-status-rejected'
};

export default Ember.Component.extend({
    i18n: Ember.inject.service(),
    theme: Ember.inject.service(),

    // translations
    labelModeratorFeedback: 'components.preprint-status-banner.feedback.moderator_feedback',
    moderator: 'components.preprint-status-banner.feedback.moderator',
    feedbackBaseMessage: 'components.preprint-status-banner.feedback.base',
    baseMessage: 'components.preprint-status-banner.message.base',

    classNames: ['preprint-status-component'],
    classNameBindings: ['getClassName'],

    getClassName: Ember.computed('submission.provider.reviewsWorkflow', 'submission.reviewsState', function() {
        return this.get('submission.reviewsState') === PENDING ?
            CLASS_NAMES[this.get('submission.provider.reviewsWorkflow')] :
            CLASS_NAMES[this.get('submission.reviewsState')];
    }),

    didReceiveAttrs() {
        if (!this.get('submission.provider.reviewsCommentsPrivate')) {
            this.get('submission.actions').then(actions => {
                let firstAction = actions.toArray()[0];
                this.set('reviewerComment', firstAction.get('comment'));
                firstAction.get('creator').then(user => {
                    this.set('reviewerName', user.get('fullName'));
                })
            });
        }
    },

    reviewerComment:'',
    reviewerName: '',

    bannerContent: Ember.computed('statusExplanation', 'workflow', function() {
        let tName = this.get('theme.isProvider') ?
            this.get('theme.provider.name') :
            this.get('i18n').t('global.brand_name');

        let tWorkflow = this.get('i18n').t(this.get('workflow'));
        let tStatusExplanation = this.get('i18n').t(this.get('statusExplanation'));

        return `${this.get('i18n').t(this.get('baseMessage'), {name: tName, reviewsWorkflow: tWorkflow})} ${tStatusExplanation}.`;
    }),

    statusExplanation: Ember.computed('submission.provider.reviewsWorkflow', 'submission.reviewsState', function() {
        return this.get('submission.reviewsState') === PENDING ?
            MESSAGE[this.get('submission.provider.reviewsWorkflow')] :
            MESSAGE[this.get('submission.reviewsState')];
    }),

    status: Ember.computed('submission.reviewsState', function() {
        return STATUS[this.get('submission.reviewsState')];
    }),

    icon: Ember.computed('submission.reviewsState', function() {
        return ICONS[this.get('submission.reviewsState')];
    }),

    workflow: Ember.computed('submission.provider.reviewsWorkflow', function () {
        return WORKFLOW[this.get('submission.provider.reviewsWorkflow')];
    }),

});
