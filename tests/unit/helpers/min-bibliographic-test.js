import { minBibliographic } from 'preprint-service/helpers/min-bibliographic';
import { module, test } from 'qunit';
import Ember from 'ember';

module('Unit | Helper | min bibliographic');

test('cannot update bibliographic field of last bib contributor', function(assert) {
   var contrib = Ember.Object.create({
        'id': '12345',
        'permission': 'admin',
        'unregisteredContributor': null,
        'bibliographic': true

    });
    var contributors = [contrib];

  let result = minBibliographic([contrib, contributors]);
   assert.equal(result, false);
});

test('can update bibliographic field on contributor if there is another bib contrib', function(assert) {
   var contrib = Ember.Object.create({
        'id': '12345',
        'permission': 'admin',
        'unregisteredContributor': null,
        'bibliographic': true

    });

    var otherContrib = Ember.Object.create({
        'id': 'abcde',
        'permission': 'read',
        'bibliographic': true
    });
    var contributors = [contrib, otherContrib];

  let result = minBibliographic([contrib, contributors]);
   assert.equal(result, true);
});

test('cannot update bibliographic field if no other bibliographic contributors', function(assert) {
   var contrib = Ember.Object.create({
        'id': '12345',
        'permission': 'admin',
        'unregisteredContributor': null,
        'bibliographic': true

    });

    var otherContrib = Ember.Object.create({
        'id': 'abcde',
        'permission': 'read',
        'bibliographic': false
    });
    var contributors = [contrib, otherContrib];

  let result = minBibliographic([contrib, contributors]);
   assert.equal(result, false);
});
