import { moduleFor, test } from 'ember-qunit';

moduleFor('route:provider/submit', 'Unit | Route | provider/submit', {
    // Specify the other units that are required for this test.
    needs: [
        'controller:submit',
        'route:submit',
        'service:metrics',
        'service:panelActions',
        'service:session',
        'service:i18n',
        'service:theme',
        'service:head-tags',
        'service:session',
        'service:currentUser',
    ],
});

test('it exists', function(assert) {
    const route = this.subject();
    assert.ok(route);
});
