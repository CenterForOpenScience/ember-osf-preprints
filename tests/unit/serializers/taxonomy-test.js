import { moduleForModel, test } from 'ember-qunit';

moduleForModel('taxonomy', 'Unit | Serializer | taxonomy', {
  // Specify the other units that are required for this test.
  needs: ['serializer:taxonomy']
});

// Replace this with your real tests.
test('it serializes records', function(assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
