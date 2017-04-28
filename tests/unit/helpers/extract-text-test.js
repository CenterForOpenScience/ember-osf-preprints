import { extractText } from 'preprint-service/helpers/extract-text';
import { module, test } from 'qunit';
import Ember from 'ember';

module('Unit | Helper | extract text');

test('extract subject children into a comma separated string', function(assert) {

    let result = extractText([Ember.A([{text: 'Civil'}, {text: 'Mechanical'}, {text: 'Computer Science'}, {text: 'Architecture'}]), 2]);
    assert.equal(result, 'Architecture, Civil');
});
