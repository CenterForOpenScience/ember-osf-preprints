import { moduleForModel, test } from 'ember-qunit';

moduleForModel('preprint', 'Unit | Serializer | preprint', {
  // Specify the other units that are required for this test.
  needs: [
      'serializer:file', 'serializer:file-provider', 'serializer:preprint',
      'model:contributor', 'model:file-provider', 'model:preprint-provider'
  ]
});

// Replace this with your real tests.
test('it serializes records', function(assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
