import { moduleFor, test } from 'ember-qunit';

moduleFor('route:provider/index', 'Unit | Route | provider/index', {
    // Specify the other units that are required for this test.
    needs: [
        'controller:submit',
        'route:index',
        'service:metrics',
        'service:theme',
        'service:session',
    ],
});

test('it exists', function(assert) {
    const route = this.subject();
    assert.ok(route);
});
