import { permissionToRemoveContributor } from 'preprint-service/helpers/permission-to-remove-contributor';
import { module, test } from 'qunit';
import EmberObject from '@ember/object';

module('Unit | Helper | permission to remove contributor');

test('can remove self as a contributor', function(assert) {
    const contrib = EmberObject.create({
        userId: '12345',
        permission: 'write',
        unregisteredContributor: null,
        bibliographic: true,

    });
    const currentUser = EmberObject.create({
        id: '12345',
        currentUserId: '12345',
    });
    const isAdmin = false;
    const editMode = true;

    const result = permissionToRemoveContributor([contrib, currentUser, isAdmin, editMode]);
    assert.equal(result, true);
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
    const editMode = true;

    const result = permissionToRemoveContributor([contrib, currentUser, isAdmin, editMode]);
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

test('cannot remove self in editMode', function(assert) {
    const contrib = EmberObject.create({
        userId: '12345',
        permission: 'write',
        unregisteredContributor: null,
        bibliographic: true,

    });
    const currentUser = EmberObject.create({
        id: '12345',
        currentUserId: '12345',
    });
    const isAdmin = false;
    const editMode = false;

    const result = permissionToRemoveContributor([contrib, currentUser, isAdmin, editMode]);
    assert.equal(result, false);
});
