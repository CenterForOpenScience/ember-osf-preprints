import { moduleFor, test } from 'ember-qunit';

moduleFor('route:discover', 'Unit | Route | discover', {
    // Specify the other units that are required for this test.
    needs: [
        'service:metrics',
        'service:theme',
        'service:session',
    ],
});

test('it exists', function(assert) {
    const route = this.subject();
    assert.ok(route);
});
