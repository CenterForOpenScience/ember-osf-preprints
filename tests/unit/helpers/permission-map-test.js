import { permissionMap } from 'preprint-service/helpers/permission-map';
import { module, test } from 'qunit';

module('Unit | Helper | permission map');

test('read maps to Read', function(assert) {
  let result = permissionMap(['read']);
  assert.equal(result, 'Read');
});

test('write maps to Read + Write', function(assert) {
  let result = permissionMap(['write']);
  assert.equal(result, 'Read + Write');
});

test('admin maps to Administrator', function(assert) {
  let result = permissionMap(['admin']);
  assert.equal(result, 'Administrator');
});
