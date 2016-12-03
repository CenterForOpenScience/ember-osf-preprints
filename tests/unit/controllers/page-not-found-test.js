import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:page-not-found', 'Unit | Controller | page not found', {
  // Specify the other units that are required for this test.
    needs: [
        'service:metrics',
        'service:theme'
    ]
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let controller = this.subject();
  assert.ok(controller);
});
