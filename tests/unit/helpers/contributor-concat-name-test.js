
import { contributorConcatName } from 'preprint-service/helpers/contributor-concat-name';
import { module, test } from 'qunit';

module('Unit | Helper | contributor concat name');

test('givenName, familyName, and fullName are defined', function(assert) {
    let result = contributorConcatName(['Mitsuha', 'Miyamizu', 'Mitsuha Miyamizu of Itomori']);
    assert.equal(result, 'Mitsuha Miyamizu');
});

test('only givenName and fullName are defined', function(assert) {
    let result = contributorConcatName(['Mitsuha', undefined, 'Mitsuha Miyamizu of Itomori']);
    assert.equal(result, 'Mitsuha Miyamizu of Itomori');
});

test('only familyName and fullName are defined', function(assert) {
    let result = contributorConcatName([undefined, 'Miyamizu', 'Mitsuha Miyamizu of Itomori']);
    assert.equal(result, 'Mitsuha Miyamizu of Itomori');
});

test('only fullName is defined', function(assert) {
    let result = contributorConcatName([undefined, undefined, 'Mitsuha Miyamizu of Itomori']);
    assert.equal(result, 'Mitsuha Miyamizu of Itomori');
});

