import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:add-preprint', 'Unit | Controller | add preprint', {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
    needs: ['validator:presence', 'validator:length', 'validator:format'],
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let controller = this.subject();
  assert.ok(controller);
});
