import { canUpdateContributor } from 'preprint-service/helpers/can-update-contributor';
import { module, test } from 'qunit';
import EmberObject from '@ember/object';

module('Unit | Helper | can update contributor');

test('cannot update other contributors as non-admin', function(assert) {
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
    const editMode = true;

    const result = canUpdateContributor([contrib, currentUser, isAdmin, editMode]);
    assert.equal(result, false);
});

test('can update other contributors as admin', function(assert) {
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
    const editMode = true;

    const result = canUpdateContributor([contrib, currentUser, isAdmin, editMode]);
    assert.equal(result, true);
});


test('cannot update self in edit mode', function(assert) {
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
    const isAdmin = true;
    const editMode = false;

    const result = canUpdateContributor([contrib, currentUser, isAdmin, editMode]);
    assert.equal(result, false);
});
