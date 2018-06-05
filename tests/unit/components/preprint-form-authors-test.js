import { run } from '@ember/runloop';
import { moduleForComponent } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';


moduleForComponent('preprint-form-authors', 'Unit | Component | preprint form authors', {
    // Specify the other units that are required for this test
    // needs: ['component:foo', 'helper:bar'],
    unit: true,
    needs: [
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
        'service:metrics',
        'service:raven',
        'service:dependencyChecker',
    ],
});


test('currentContributorIds computed property', function(assert) {
    const component = this.subject();
    this.inject.service('store');

    run(() => {
        const contributor = this.store.createRecord('contributor', { userId: 'quedd' });

        const node = this.store.createRecord('node', {
            title: 'test title',
            description: 'test description',
            contributors: [contributor],
        });

        component.set('contributors', node.get('contributors'));
        assert.deepEqual(component.get('currentContributorIds'), ['quedd']);
    });
});

test('sendEmail computed property', function(assert) {
    const component = this.subject();
    component.set('editMode', true);
    assert.strictEqual(component.get('sendEmail'), 'preprint');
    component.set('editMode', false);
    assert.strictEqual(component.get('sendEmail'), false);
});

test('numParentContributors computed property', function(assert) {
    const component = this.subject();
    this.inject.service('store');

    run(() => {
        const contributor1 = this.store.createRecord('contributor', { userId: 'quedd' });
        const contributor2 = this.store.createRecord('contributor', { userId: 'rsffe' });


        const node = this.store.createRecord('node', {
            title: 'test title',
            description: 'test description',
            contributors: [contributor1, contributor2],
        });

        component.set('parentNode', node);
        assert.deepEqual(component.get('numParentContributors'), 2);
    });
});
