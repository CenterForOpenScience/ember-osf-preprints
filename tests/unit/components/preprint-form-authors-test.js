import { moduleForComponent } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';


moduleForComponent('preprint-form-authors', 'Unit | Component | preprint form authors', {
    // Specify the other units that are required for this test
    // needs: ['component:foo', 'helper:bar'],
    unit: true,
    needs: [
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
        'service:dependencyChecker',
    ],
});


test('sendEmail computed property', function(assert) {
    const component = this.subject();
    component.set('editMode', true);
    assert.strictEqual(component.get('sendEmail'), 'preprint');
    component.set('editMode', false);
    assert.strictEqual(component.get('sendEmail'), false);
});
