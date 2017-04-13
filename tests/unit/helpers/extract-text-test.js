import { extractText } from 'preprint-service/helpers/extract-text';
import { module, test } from 'qunit';
import Ember from 'ember';

module('Unit | Helper | extract text');

test('extract subject children into a comma separated string', function(assert) {

    let result = extractText([Ember.A([{text: 'Civil'}, {text: 'Mechanical'}]), 2]);
    assert.equal(result, 'Civil, Mechanical');
});
