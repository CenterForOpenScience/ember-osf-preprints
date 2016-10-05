import { getAncestorDescriptor } from 'preprint-service/helpers/get-ancestor-descriptor';
import { module, test } from 'qunit';
import Ember from 'ember';


module('Unit | Helper | get ancestor descriptor');

// Replace this with your real tests.
test('it works', function(assert) {
    var root = Ember.Object.create({
        'id': '12345',
        'title': "Root title"
    });
    var parent = Ember.Object.create({
        'id': 'abcde',
        'title': 'Parent title',
        'parent': root
    });
    var node = Ember.Object.create({
        'id': 'fghij',
        'root': root,
        'parent': parent,
        'title': 'Node title'
    });
    let result = getAncestorDescriptor([node]);
    assert.equal(result, 'Root title / Parent title / ');

});
