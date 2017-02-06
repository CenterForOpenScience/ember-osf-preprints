import { isSectionEditable } from 'preprint-service/helpers/is-section-editable';
import { module, test } from 'qunit';

module('Unit | Helper | is section editable');

test('can edit organize section', function(assert) {
  let result = isSectionEditable(['organize']);
  assert.equal(result, true);
});

test('cannot edit location_of_preprint section', function(assert) {
  let result = isSectionEditable(['location_of_preprint']);
  assert.equal(result, false);
});

test('cannot edit Update section', function(assert) {
  let result = isSectionEditable(['Update']);
  assert.equal(result, false);
});

test('cannot edit Submit section', function(assert) {
  let result = isSectionEditable(['Submit']);
  assert.equal(result, false);
});
