
import { sliceArray } from 'preprint-service/helpers/slice-array';
import { module, test } from 'qunit';

module('Unit | Helper | slice array');

test('slices begin to end, end not included', function(assert) {
    const array = [1, 2, 3, 4];
    const result = sliceArray([array, 0, 2]);
    assert.equal(result[0], 1);
    assert.equal(result[1], 2);
    assert.equal(result.length, 2);
});

test('slice with indices larger than array', function(assert) {
    const array = [1, 2, 3, 4];
    const result = sliceArray([array, 0, 10]);
    assert.equal(result.length, 4);
});
