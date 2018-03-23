import pathJoin from 'preprint-service/utils/path-join';
import { module, test } from 'qunit';

module('Unit | Utility | path join');

test('it works', function(assert) {
    const result = pathJoin('/this/', 'has', 'all/', '/combos', '/of-slashes');
    assert.equal(result, '/this/has/all/combos/of-slashes');
});
