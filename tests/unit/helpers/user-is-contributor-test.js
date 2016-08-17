import { userIsContributor } from 'preprint-service/helpers/user-is-contributor';
import { module, test } from 'qunit';
import Ember from 'ember';

module('Unit | Helper | user is contributor');

test('Returns true if user is a contributor', function(assert) {
    var user = Ember.Object.create({
        id: '12345'
    });
    var contributors = [Ember.Object.create({
        userId: '12345'
    })];
  let result = userIsContributor([user, contributors]);
  assert.equal(result, true);
});


test('Returns false if user is not a contributor', function(assert) {
    var user = Ember.Object.create({
        id: '12345'
    });
    var contributors = [Ember.Object.create({
        userId: 'abcde'
    })];
  let result = userIsContributor([user, contributors]);
  assert.equal(result, false);
});

