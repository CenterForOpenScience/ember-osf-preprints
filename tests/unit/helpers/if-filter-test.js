import { ifFilter } from 'preprint-service/helpers/if-filter';
import { module, test } from 'qunit';

module('Unit | Helper | if filter');

test('provider matches filter', function(assert) {
  let element = 'OSF';
  let filter = ['OSF'];
  let result = ifFilter([element, filter]);
  assert.equal(result, true);
});

test('provider does not match filter', function(assert) {
  let element = 'Cogprints';
  let filter = ['OSF'];
  let result = ifFilter([element, filter]);
  assert.equal(result, false);
});
