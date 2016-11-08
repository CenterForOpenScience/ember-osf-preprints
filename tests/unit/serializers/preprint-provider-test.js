import { moduleForModel, test } from 'ember-qunit';

moduleForModel('preprint-provider', 'Unit | Serializer | preprint provider', {
    // Specify the other units that are required for this test.
    needs: [
        'model:preprint',
        'model:taxonomy',
        'serializer:preprint',
        'serializer:preprint-provider',
        'serializer:taxonomy',
    ]
});

// Replace this with your real tests.
test('it serializes records', function(assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
