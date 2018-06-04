import { userIsContributor } from 'preprint-service/helpers/user-is-contributor';
import { module, test } from 'qunit';
import EmberObject from '@ember/object';

module('Unit | Helper | user is contributor');

test('Returns true if user is a contributor', function(assert) {
    const user = EmberObject.create({
        id: '12345',
    });
    const contributors = [EmberObject.create({
        userId: '12345',
    })];
    const result = userIsContributor([user, contributors]);
    assert.equal(result, true);
});


test('Returns false if user is not a contributor', function(assert) {
    const user = EmberObject.create({
        id: '12345',
    });
    const contributors = [EmberObject.create({
        userId: 'abcde',
    })];
    const result = userIsContributor([user, contributors]);
    assert.equal(result, false);
});

