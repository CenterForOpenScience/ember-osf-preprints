import { conditionsForContribRemoval } from 'preprint-service/helpers/conditions-for-contrib-removal';
import { module, test } from 'qunit';

module('Unit | Helper | conditions for contrib removal');

test('cannot remove last admin contributor', function(assert) {
    var contributorToRemove = {
        'id': '12345'

    };
    var contributors = [{
        'id': '12345',
        'permission': 'admin',
        'bibliographic': false
    }];
    let result = conditionsForContribRemoval([contributorToRemove, contributors]);
    assert.equal(result, false);
});
