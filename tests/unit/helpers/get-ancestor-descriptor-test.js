import { getAncestorDescriptor } from 'preprint-service/helpers/get-ancestor-descriptor';
import { module, test } from 'qunit';
import EmberObject from '@ember/object';


module('Unit | Helper | get ancestor descriptor');

test('One, two, three, and four-level hierarchies', function(assert) {
    let root = EmberObject.create({
        'id': '12345',
        'title': 'Great-Grandparent',
        'root': EmberObject.create({
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
    console.log('AAAAAAAAAAAAAAAAAAAA')
    console.log(typeof root);
    let grandparent = EmberObject.create({
        'id': '67890',
        'title': 'Grandparent',
        'parent': root,
        'root': root
    });

    let parent = EmberObject.create({
        'id': 'abcde',
        'title': 'Parent',
        'parent': grandparent,
        'root': root
    });
    let node = EmberObject.create({
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
    let child = EmberObject.create({
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
