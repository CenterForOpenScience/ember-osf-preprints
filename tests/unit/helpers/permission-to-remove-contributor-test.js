import { permissionToRemoveContributor } from 'preprint-service/helpers/permission-to-remove-contributor';
import { module, test } from 'qunit';
import Ember from 'ember';

module('Unit | Helper | permission to remove contributor');

test('can remove self as a contributor', function(assert) {
    var contrib = Ember.Object.create({
        'userId': '12345',
        'permission': 'admin',
        'unregisteredContributor': null,
        'bibliographic': true

    });
    var currentUser = Ember.Object.create({
        id: '12345',
        currentUserId: '12345'
    });
    var stillAdmin = false;
    var node = Ember.Object.create({
        'registration': false
    });

    let result = permissionToRemoveContributor([contrib, currentUser, stillAdmin, node]);
    assert.equal(result, true);
});


test('cannot remove contributor if you are not admin', function(assert) {
    var contrib = Ember.Object.create({
        'userId': 'abcde',
        'permission': 'admin',
        'unregisteredContributor': null,
        'bibliographic': true

    });
    var currentUser = Ember.Object.create({
        id: '12345',
        currentUserId: '12345'
    });
    var stillAdmin = false;
    var node = Ember.Object.create({
        'registration': false
    });

    let result = permissionToRemoveContributor([contrib, currentUser, stillAdmin, node]);
    assert.equal(result, false);
});


test('can remove another contributor if you are admin', function(assert) {
    var contrib = Ember.Object.create({
        'userId': 'abcde',
        'permission': 'admin',
        'unregisteredContributor': null,
        'bibliographic': true

    });
    var currentUser = Ember.Object.create({
        id: '12345',
        currentUserId: '12345'
    });
    var stillAdmin = true;
    var node = Ember.Object.create({
        'registration': false
    });

    let result = permissionToRemoveContributor([contrib, currentUser, stillAdmin, node]);
    assert.equal(result, true);
});
