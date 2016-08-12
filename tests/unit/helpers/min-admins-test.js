import { minAdmins } from 'preprint-service/helpers/min-admins';
import { module, test } from 'qunit';


module('Unit | Helper | min admins');

// Replace this with your real tests.
test('Modifying this contributor does not leave min number of admins', function(assert) {
    var contrib = {
        'id': '12345',
        'permission': 'admin',
        'unregisteredContributor': null

    };
    var contributors = [{
        'id': '12345',
        'permission': 'admin',
        'bibliographic': false,
        'unregisteredContributor': null

    }];

  let result = minAdmins([contrib, contributors]);
  assert.equal(result, false);
});
