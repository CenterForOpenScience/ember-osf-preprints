import { conditionsForContribRemoval } from 'preprint-service/helpers/conditions-for-contrib-removal';
import { module, test } from 'qunit';
import Ember from 'ember';


module('Unit | Helper | conditions for contrib removal');

test('cannot remove last admin contributor', function(assert) {
    var contribToRemove = Ember.Object.create({
        'id': '12345',
        'permission': 'admin',
        'unregisteredContributor': null

    });
    var contributors = [contribToRemove];
    let result = conditionsForContribRemoval([contribToRemove, contributors]);
    assert.equal(result, false);
});


test('cannot remove last bib contributor', function(assert) {
    var contribToRemove = Ember.Object.create({
        'id': '12345',
        'bibliographic': true,
        'unregisteredContributor': null

    });

    var otherContrib = Ember.Object.create({
        'id': 'abcde',
        'bibliographic': false,
        'permission': 'admin'
    });
    var contributors = [contribToRemove, otherContrib];
    let result = conditionsForContribRemoval([contribToRemove, contributors]);
    assert.equal(result, false);
});

test('cannot remove contributor if still have registered admin and bib conditions met', function(assert) {
    var contribToRemove = Ember.Object.create({
        'id': '12345',
        'bibliographic': true,
        'admin': true,
        'unregisteredContributor': null

    });

    var otherContrib = Ember.Object.create({
        'id': 'abcde',
        'bibliographic': true,
        'permission': 'admin',
        'unregisteredContributor': null
    });
    var contributors = [contribToRemove, otherContrib];
    let result = conditionsForContribRemoval([contribToRemove, contributors]);
    assert.equal(result, true);
});
