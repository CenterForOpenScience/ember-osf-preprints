import { filterReplace } from 'preprint-service/helpers/filter-replace';
import { module, test } from 'qunit';

module('Unit | Helper | filter replace');

test('replace long provider name', function(assert) {
  let result = filterReplace(['Open Science Framework']);
  assert.equal(result, 'OSF');
});

test('return original filter if not in filters dictionary', function(assert) {
  let result = filterReplace(['Engineering']);
  assert.equal(result, 'Engineering');
});
