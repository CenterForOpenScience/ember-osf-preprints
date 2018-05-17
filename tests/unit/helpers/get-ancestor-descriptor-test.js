import { getAncestorDescriptor } from 'preprint-service/helpers/get-ancestor-descriptor';
import { module, test } from 'qunit';
import EmberObject from '@ember/object';


module('Unit | Helper | get ancestor descriptor');

test('One, two, three, and four-level hierarchies', function(assert) {
    const root = EmberObject.create({
        id: '12345',
        title: 'Great-Grandparent',
        root: EmberObject.create({
            id: '12345',
            title: 'Great-Grandparent',
        }),
        _internalModel: {
            _relationships: {
                initializedRelationships: {

                },
            },
        },
        parent: null,
    });

    const grandparent = EmberObject.create({
        id: '67890',
        title: 'Grandparent',
        parent: root,
        root,
    });

    const parent = EmberObject.create({
        id: 'abcde',
        title: 'Parent',
        parent: grandparent,
        root,
    });
    const node = EmberObject.create({
        id: 'fghij',
        root,
        parent,
        title: 'Child',
    });

    const describeNode = getAncestorDescriptor([node]);
    assert.equal(describeNode, 'Great-Grandparent / ... / Parent / ');

    const describeParent = getAncestorDescriptor([parent]);
    assert.equal(describeParent, 'Great-Grandparent / Grandparent / ');

    const describeGrandparent = getAncestorDescriptor([grandparent]);
    assert.equal(describeGrandparent, 'Great-Grandparent / ');

    const describeGreatGrandparent = getAncestorDescriptor([root]);
    assert.equal(describeGreatGrandparent, '');
});

test('Test private parent', function(assert) {
    const child = EmberObject.create({
        id: 'abcde',
        title: 'child',
        _internalModel: {
            _relationships: {
                initializedRelationships: {
                    root: {
                        link: '/nodes/12345/',
                    },
                    parent: {
                        link: '/nodes/12345/',
                    },
                },
            },
        },
    });

    const result = getAncestorDescriptor([child]);
    assert.equal(result, 'Private / ');
});
