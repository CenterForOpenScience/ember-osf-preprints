import { moduleFor, test } from 'ember-qunit';

moduleFor('route:provider/content', 'Unit | Route | provider/content', {
    // Specify the other units that are required for this test.
    needs: [
        'controller:submit',
        'route:content',
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
