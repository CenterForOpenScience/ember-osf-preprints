import { elasticEscape } from 'preprint-service/utils/elastic-query';
import { module, test } from 'qunit';

module('Unit | Utility | elastic query');

// Replace this with your real tests.
test('common elasticsearch special characters are escaped', function(assert) {
    let result = elasticEscape('Malformed query " && special operators + escaping & not more than needed');
    assert.equal(result, 'Malformed query \\" \\&& special operators \\+ escaping & not more than needed',
        'Special charcters were not correctly escaped');
});
