import { isSectionEditable } from 'preprint-service/helpers/is-section-editable';
import { module, test } from 'qunit';

module('Unit | Helper | is section editable');

// Replace this with your real tests.
test('it works', function(assert) {
  let result = isSectionEditable(['organize']);
  assert.equal(result, true);
});
