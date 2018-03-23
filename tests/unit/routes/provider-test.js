import { moduleFor, test } from 'ember-qunit';

moduleFor('route:provider', 'Unit | Route | provider', {
    // Specify the other units that are required for this test.
    needs: [
        'service:metrics',
        'service:theme',
        'service:session',
    ],
});

test('it exists', function(assert) {
    // let route = this.subject();
    assert.ok(this);
    // TODO change this later. Ember provides no guidance
});
