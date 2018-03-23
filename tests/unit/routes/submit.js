import { moduleFor, test } from 'ember-qunit';

moduleFor('route:submit', 'Unit | Route | submit', {
    // Specify the other units that are required for this test.
    needs: [
        'controller:foo',
        'service:session',
    ],
});

test('it exists', function(assert) {
    const route = this.subject();
    assert.ok(route);
});
