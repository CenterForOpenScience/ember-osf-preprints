import { numberFormat } from 'preprint-service/helpers/number-format';
import { module, test, skip } from 'qunit';

module('Unit | Helper | number format');

// Works in Chrome but doesn't work in terminal
skip('number-format-tests', function() {
    test('transforms 4 digit number', function(assert) {
        const result = numberFormat([3500]);
        assert.equal(result, '3,500');
    });

    test('transforms 10 digit number', function(assert) {
        const result = numberFormat([1234567890]);
        assert.equal(result, '1,234,567,890');
    });
});
