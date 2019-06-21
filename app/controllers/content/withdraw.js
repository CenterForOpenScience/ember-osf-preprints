import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { validator, buildValidations } from 'ember-cp-validations';

const PRE_MODERATION_ACCEPTED = 'pre-moderation-accepted';
const PRE_MODERATION_PENDING = 'pre-moderation-pending';
const PRE_MODERATION = 'pre-moderation';
const POST_MODERATION = 'post-moderation';
const NO_MODERATION = 'no-moderation';

const NOTICE_MESSAGE = {
    [PRE_MODERATION_ACCEPTED]: 'withdraw.pre_moderation_notice_accepted',
    [PRE_MODERATION_PENDING]: 'withdraw.pre_moderation_notice_pending',
    [POST_MODERATION]: 'withdraw.post_moderation_notice',
    [NO_MODERATION]: 'withdraw.no_moderation_notice',
};

const WithdrawValidations = buildValidations({
    explanation: {
        description: 'Explanation',
        validators: [
            validator('presence', true),
            validator('length', {
                min: 25,
            }),
        ],
    },
});

export default Controller.extend(WithdrawValidations, {
    theme: service(),
    store: service(),
    currentUser: service(),
    toast: service(),
    i18n: service(),
    explanation: '',
    didValidate: false,

    notice: computed('model.provider.{reviewsWorkflow,documentType}', function () {
        const reviewsWorkflow = this.get('model.provider.reviewsWorkflow') || NO_MODERATION;
        const reviewsState = this.get('model.reviewsState');
        let noticeKey = reviewsWorkflow;
        if (reviewsWorkflow === PRE_MODERATION) {
            noticeKey = `${noticeKey}-${reviewsState}`;
        }
        return this.get('i18n').t(NOTICE_MESSAGE[noticeKey], {
            documentType: this.get('model.provider.documentType'),
        });
    }),

    withdrawButtonLabel: computed('model.isPublished', function () {
        return this.get('model.isPublished') ? 'withdraw.withdraw_button_published' : 'withdraw.withdraw_button_not_published';
    }),

    actions: {
        cancel() {
            this.transitionToRoute(
                `${this.get('theme.isSubRoute') ? 'provider.' : ''}content`,
                this.get('model'),
            );
        },
    },

    submitWithdrawalRequest: task(function* () {
        this.set('didValidate', true);
        if (!this.get('validations.isValid')) {
            return;
        }
        const request = this.store.createRecord('preprint-request', {
            comment: this.get('explanation'),
            requestType: 'withdrawal',
            target: this.get('model'),
        });
        try {
            yield request.save();
        } catch (e) {
            this.get('toast').error(e.errors[0].detail);
            return;
        }
        if (!this.get('model.isPublished') && this.get('model.provider.reviewsWorkflow') === PRE_MODERATION) {
            // If this preprint is not published and the provider is pre-mod.
            // Transition to the landing page.
            this.transitionToRoute(`${this.get('theme.isSubRoute') ? 'provider.' : ''}index`);
            this.get('toast').success(this.get('i18n').t('withdraw.successfully_withdrawn', { documentType: this.get('model.provider.documentType') }));
        } else {
            // Go to the detail page once the withdrawal request is successfully submitted.
            this.transitionToRoute(`${this.get('theme.isSubRoute') ? 'provider.' : ''}content`, this.get('model'));
        }
    }),
});
