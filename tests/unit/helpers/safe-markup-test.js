import { safeMarkup } from 'preprint-service/helpers/safe-markup';
import { module, test } from 'qunit';

module('Unit | Helper | safe markup');

test('marks string as safe for unescaped output', function(assert) {
    const result = safeMarkup(['<div>myString</div>']);
    assert.equal(result.toString(), '<div>myString</div>');
});
