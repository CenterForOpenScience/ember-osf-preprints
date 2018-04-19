import { run } from '@ember/runloop';
import { moduleForComponent } from 'ember-qunit';
import Service from '@ember/service';
import test from 'ember-sinon-qunit/test-support/test';
import tHelper from 'ember-i18n/helper';

// Stub i18n service
const i18nStub = Service.extend({
    t(key, arg = null) {
        const translated = {
            'global.brand_name': 'The Panda Archive of bamboo',
            'global.pre_moderation': 'pre-moderation',
            'global.post_moderation': 'post-moderation',
            'components.preprint-status-banner.message.pending_pre': 'is not publicly available or searchable until approved by a moderator',
            'components.preprint-status-banner.message.pending_post': 'is publicly available and searchable but is subject to removal by a moderator',
            'components.preprint-status-banner.message.accepted': 'has been accepted by a moderator and is publicly available and searchable',
            'components.preprint-status-banner.message.rejected': 'has been rejected by a moderator and is not publicly available or searchable',
        };
        if (arg) {
            translated['components.preprint-status-banner.message.base'] = `${arg.name} uses pre-moderation. This ${arg.reviewsWorkflow}`;
        }
        return translated[key];
    },
});

const fakeProvider = {
    id: 'pandaXriv',
    name: 'The Panda Archive of bamboo',
    isProvider: true,
};

// Stub theme service
const themeStub = Service.extend({
    provider: fakeProvider,
});

moduleForComponent('preprint-status-banner', 'Unit | Component | preprint status banner', {
    // Specify the other units that are required for this test
    unit: true,
    needs: [
        'model:review-action',
        'model:node',
        'model:user',
        'model:preprint',
        'model:preprint-provider',
        'model:institution',
        'model:comment',
        'model:contributor',
        'model:citation',
        'model:file-provider',
        'model:registration',
        'model:draft-registration',
        'model:log',
        'model:taxonomy',
        'model:license',
        'model:wiki',
        'service:i18n',
        'service:theme',
        'service:session',
        'service:head-tags',
    ],
    beforeEach() {
        this.registry.register('helper:t', tHelper);
        this.register('service:i18n', i18nStub);
        this.register('service:theme', themeStub);
    },

});


test('getClassName computed property', function(assert) {
    this.inject.service('store');
    const component = this.subject();

    run(() => {
        const node = this.store.createRecord('node', {
            title: 'test title',
            description: 'test description',
        });

        const provider = this.store.createRecord('preprint-provider', {
            reviewsWorkflow: 'pre-moderation',
        });

        const submission = this.store.createRecord('preprint', { node, provider });
        component.setProperties({ submission });
        component.set('reviewsWorkflow', 'pre-moderation');

        component.set('submission.reviewsState', 'pending');
        assert.strictEqual(component.get('getClassName'), 'preprint-status-pending-pre');

        component.set('submission.reviewsState', 'accepted');
        assert.strictEqual(component.get('getClassName'), 'preprint-status-accepted');
    });
});

test('bannerContent computed property', function(assert) {
    this.inject.service('store');

    const component = this.subject();


    run(() => {
        const node = this.store.createRecord('node', {
            title: 'test title',
            description: 'test description',
        });


        const provider = this.store.createRecord('preprint-provider', {
            reviewsWorkflow: 'pre-moderation',
        });

        const submission = this.store.createRecord('preprint', { node, provider });
        component.setProperties({ submission });


        component.set('reviewsWorkflow', 'pre-moderation');
        component.set('submission.reviewsState', 'pending');

        assert.strictEqual(
            component.get('bannerContent'),
            'The Panda Archive of bamboo uses pre-moderation. ' +
            'This pre-moderation is not publicly available or searchable until approved by a moderator.',
        );

        component.set('submission.reviewsState', 'accepted');

        assert.strictEqual(
            component.get('bannerContent'),
            'The Panda Archive of bamboo uses pre-moderation.' +
            ' This pre-moderation has been accepted by a moderator and is publicly available and searchable.',
        );
    });
});

test('status computed property', function(assert) {
    this.inject.service('store');
    const component = this.subject();

    run(() => {
        const node = this.store.createRecord('node', {
            title: 'test title',
            description: 'test description',
        });

        const submission = this.store.createRecord('preprint', { node });
        component.setProperties({ submission });


        const statusList = ['pending', 'accepted', 'rejected'];

        for (let i = 0; i < statusList.length; i++) {
            component.set('submission.reviewsState', statusList[i]);
            assert.strictEqual(component.get('status'), `components.preprint-status-banner.${statusList[i]}`);
        }
    });
});

test('icon computed property', function(assert) {
    this.inject.service('store');
    const component = this.subject();

    run(() => {
        const node = this.store.createRecord('node', {
            title: 'test title',
            description: 'test description',
        });

        const submission = this.store.createRecord('preprint', { node });
        component.setProperties({ submission });

        component.set('submission.reviewsState', 'pending');
        assert.strictEqual(component.get('icon'), 'fa-hourglass-o');

        component.set('submission.reviewsState', 'accepted');
        assert.strictEqual(component.get('icon'), 'fa-check-circle-o');

        component.set('submission.reviewsState', 'rejected');
        assert.strictEqual(component.get('icon'), 'fa-times-circle-o');
    });
});

test('workflow computed property', function(assert) {
    this.inject.service('store');
    const component = this.subject();

    run(() => {
        const node = this.store.createRecord('node', {
            title: 'test title',
            description: 'test description',
        });

        const provider = this.store.createRecord('preprint-provider', {
            reviewsWorkflow: 'pre-moderation',
        });

        const submission = this.store.createRecord('preprint', { node, provider });
        component.setProperties({ submission });


        assert.strictEqual(component.get('workflow'), 'global.pre_moderation');

        component.set('submission.provider.reviewsWorkflow', 'post-moderation');
        assert.strictEqual(component.get('workflow'), 'global.post_moderation');
    });
});
