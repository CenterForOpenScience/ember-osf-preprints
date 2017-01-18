import fixSpecialChar from 'preprint-service/utils/fix-special-char';
import { module, test } from 'qunit';

module('Unit | Utility | fix special char');

// Replace this with your real tests.
test('test special characters', function(assert) {
  let result = fixSpecialChar('test special characters &');
  assert.equal(result,'test special characters &');
});
