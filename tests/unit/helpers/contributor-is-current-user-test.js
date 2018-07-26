import { contributorIsCurrentUser } from 'preprint-service/helpers/contributor-is-current-user';
import { module, test } from 'qunit';
import EmberObject from '@ember/object';


module('Unit | Helper | contributor is current user');

test('current user equals contributor', function(assert) {
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
    const result = contributorIsCurrentUser([contrib, currentUser]);
    assert.equal(result, true);
});

test('current user does not equal contributor', function(assert) {
    const contrib = EmberObject.create({
        userId: '12345',
        permission: 'admin',
        unregisteredContributor: null,
        bibliographic: true,

    });
    const currentUser = EmberObject.create({
        id: 'abcde',
        currentUserId: 'abcde',
    });
    const result = contributorIsCurrentUser([contrib, currentUser]);
    assert.equal(result, false);
});
