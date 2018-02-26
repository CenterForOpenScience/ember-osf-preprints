import { conditionsForContribRemoval } from 'preprint-service/helpers/conditions-for-contrib-removal';
import { module, test } from 'qunit';
import EmberObject from '@ember/object';


module('Unit | Helper | conditions for contrib removal');
test('cannot remove last admin contributor', function(assert) {
    var contribToRemove = EmberObject.create({
        'id': '12345',
        'permission': 'admin',
        'bibliographic': true,
        'unregisteredContributor': null
    });
    var otherContrib = EmberObject.create({
        'id': 'abcde',
        'bibliographic': true,
        'permission': 'read'
    });
    var contributors = [contribToRemove, otherContrib];
    let result = conditionsForContribRemoval([contribToRemove, contributors]);
    assert.equal(result, false);
});

test('cannot remove last bibliographic contributor', function(assert) {
    var contribToRemove = EmberObject.create({
        'id': '12345',
        'bibliographic': true,
        'permission': 'admin',
        'unregisteredContributor': null
    });
    var otherContrib = EmberObject.create({
        'id': 'abcde',
        'bibliographic': false,
        'permission': 'admin'
    });
    var contributors = [contribToRemove, otherContrib];
    let result = conditionsForContribRemoval([contribToRemove, contributors]);
    assert.equal(result, false);
});

test('sole admin contributor must be registered', function(assert) {
    var contribToRemove = EmberObject.create({
        'id': '12345',
        'bibliographic': true,
        'permission': 'admin',
        'unregisteredContributor': null
    });
    var otherContrib = EmberObject.create({
        'id': 'abcde',
        'bibliographic': true,
        'permission': 'admin',
        'unregisteredContributor': 'Dawn'
    });
    var contributors = [contribToRemove, otherContrib];
    let result = conditionsForContribRemoval([contribToRemove, contributors]);
    assert.equal(result, false);
});

test('can remove contributor if registered admin and bibliographic conditions met', function(assert) {
    var contribToRemove = EmberObject.create({
        'id': '12345',
        'bibliographic': true,
        'admin': true,
        'unregisteredContributor': null
    });
    var otherContrib = EmberObject.create({
        'id': 'abcde',
        'bibliographic': true,
        'permission': 'admin',
        'unregisteredContributor': null
    });
    var contributors = [contribToRemove, otherContrib];
    let result = conditionsForContribRemoval([contribToRemove, contributors]);
    assert.equal(result, true);
});
