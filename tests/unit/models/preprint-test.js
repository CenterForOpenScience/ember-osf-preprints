import { moduleForModel, test } from 'ember-qunit';

moduleForModel('preprint', 'Unit | Model | preprint', {
  // Specify the other units that are required for this test.
  needs: ['model:contributor', 'model:file', 'model:file-provider', 'model:preprint-provider']
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
