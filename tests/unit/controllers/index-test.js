import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:index', 'Unit | Controller | index', {
    // Specify the other units that are required for this test.
    needs: ['service:metrics', 'service:theme', 'service:session']
});

// Replace this with your real tests.
test('it exists', function(assert) {
    let controller = this.subject();
    assert.ok(controller);
});
