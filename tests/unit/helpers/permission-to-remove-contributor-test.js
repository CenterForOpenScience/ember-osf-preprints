import { permissionToRemoveContributor } from 'preprint-service/helpers/permission-to-remove-contributor';
import { module, test } from 'qunit';
import EmberObject from '@ember/object';

module('Unit | Helper | permission to remove contributor');

test('cannot remove self as a contributor', function(assert) {
    const contrib = EmberObject.create({
        userId: '12345',
        permission: 'admin',
        unregisteredContributor: null,
        bibliographic: true,

    });
    const currentUser = EmberObject.create({
        id: '12345',
        currentUserId: '12345',
    });
    const isAdmin = false;
    const node = EmberObject.create({
        registration: false,
    });

    const result = permissionToRemoveContributor([contrib, currentUser, isAdmin, node]);
    assert.equal(result, false);
});


test('cannot remove contributor if you are not admin', function(assert) {
    const contrib = EmberObject.create({
        userId: 'abcde',
        permission: 'admin',
        unregisteredContributor: null,
        bibliographic: true,

    });
    const currentUser = EmberObject.create({
        id: '12345',
        currentUserId: '12345',
    });
    const isAdmin = false;
    const node = EmberObject.create({
        registration: false,
    });

    const result = permissionToRemoveContributor([contrib, currentUser, isAdmin, node]);
    assert.equal(result, false);
});


test('can remove another contributor if you are admin', function(assert) {
    const contrib = EmberObject.create({
        userId: 'abcde',
        permission: 'admin',
        unregisteredContributor: null,
        bibliographic: true,

    });
    const currentUser = EmberObject.create({
        id: '12345',
        currentUserId: '12345',
    });
    const isAdmin = true;
    const node = EmberObject.create({
        registration: false,
    });

    const result = permissionToRemoveContributor([contrib, currentUser, isAdmin, node]);
    assert.equal(result, true);
});

test('cannot remove contributor from registration', function(assert) {
    // This scenario should never be happening.
    const contrib = EmberObject.create({
        userId: 'abcde',
        permission: 'admin',
        unregisteredContributor: null,
        bibliographic: true,

    });
    const currentUser = EmberObject.create({
        id: '12345',
        currentUserId: '12345',
    });
    const isAdmin = true;
    const node = EmberObject.create({
        registration: true,
    });

    const result = permissionToRemoveContributor([contrib, currentUser, isAdmin, node]);
    assert.equal(result, false);
});
