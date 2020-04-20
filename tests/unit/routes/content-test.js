import { moduleFor, test } from 'ember-qunit';

moduleFor('route:content', 'Unit | Route | content', {
    // Specify the other units that are required for this test.
    needs: [
        'service:metrics',
        'service:theme',
        'service:session',
        'service:current-user',
        'service:features',
    ],
});

test('it exists', function(assert) {
    const route = this.subject();
    assert.ok(route);
});
