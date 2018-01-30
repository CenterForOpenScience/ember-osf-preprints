
import { contributorName } from 'preprint-service/helpers/contributor-name';
import { module, test } from 'qunit';

module('Unit | Helper | contributor name');

test('givenName, familyName, and fullName are defined', function(assert) {
    let result = contributorName(['Mitsuha', 'Miyamizu', 'Mitsuha Miyamizu of Itomori']);
    assert.equal(result, 'Mitsuha Miyamizu');
});

test('only givenName and fullName are defined', function(assert) {
    let result = contributorName(['Mitsuha', undefined, 'Mitsuha Miyamizu of Itomori']);
    assert.equal(result, 'Mitsuha Miyamizu of Itomori');
});

test('only familyName and fullName are defined', function(assert) {
    let result = contributorName([undefined, 'Miyamizu', 'Mitsuha Miyamizu of Itomori']);
    assert.equal(result, 'Mitsuha Miyamizu of Itomori');
});

test('only fullName is defined', function(assert) {
    let result = contributorName([undefined, undefined, 'Mitsuha Miyamizu of Itomori']);
    assert.equal(result, 'Mitsuha Miyamizu of Itomori');
});

