import { permissionToRemoveContributor } from 'preprint-service/helpers/permission-to-remove-contributor';
import { module, test } from 'qunit';

module('Unit | Helper | permission to remove contributor');

// Replace this with your real tests.
test('it works', function(assert) {
  let result = permissionToRemoveContributor([42]);
  assert.ok(result);
});
