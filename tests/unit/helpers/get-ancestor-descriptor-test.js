import { getAncestorDescriptor } from 'preprint-service/helpers/get-ancestor-descriptor';
import { module, test } from 'qunit';
import Ember from 'ember';


module('Unit | Helper | get ancestor descriptor');

test('One, two, three, and four-level hierarchies', function(assert) {
    let root = Ember.Object.create({
        'id': '12345',
        'title': 'Great-Grandparent',
        'root': Ember.Object.create({
            'id': '12345',
            'title': 'Great-Grandparent'
        }),
        '_internalModel': {
            '_relationships': {
                'initializedRelationships': {

                }
            }
        },
        parent: null
    });

    let grandparent = Ember.Object.create({
        'id': '67890',
        'title': 'Grandparent',
        'parent': root,
        'root': root
    });

    let parent = Ember.Object.create({
        'id': 'abcde',
        'title': 'Parent',
        'parent': grandparent,
        'root': root
    });
    let node = Ember.Object.create({
        'id': 'fghij',
        'root': root,
        'parent': parent,
        'title': 'Child'
    });

    let describeNode = getAncestorDescriptor([node]);
    assert.equal(describeNode, 'Great-Grandparent / ... / Parent / ');

    let describeParent = getAncestorDescriptor([parent]);
    assert.equal(describeParent, 'Great-Grandparent / Grandparent / ');

    let describeGrandparent = getAncestorDescriptor([grandparent]);
    assert.equal(describeGrandparent, 'Great-Grandparent / ');

    let describeGreatGrandparent = getAncestorDescriptor([root]);
    assert.equal(describeGreatGrandparent, '');
});

test('Test private parent', function(assert) {
    let child = Ember.Object.create({
        id: 'abcde',
        title: 'child',
        '_internalModel': {
            '_relationships': {
                'initializedRelationships': {
                    'root': {
                        'link': '/nodes/12345/'
                    },
                    'parent': {
                        'link': '/nodes/12345/'
                    }
                }
            }
        },
    });

    let result = getAncestorDescriptor([child]);
    assert.equal(result, 'Private / ');
});
