import { minBibliographic } from 'preprint-service/helpers/min-bibliographic';
import { module, test } from 'qunit';
import EmberObject from '@ember/object';

module('Unit | Helper | min bibliographic');

test('cannot update bibliographic field of last bib contributor', function(assert) {
    const contrib = EmberObject.create({
        id: '12345',
        permission: 'admin',
        unregisteredContributor: null,
        bibliographic: true,

    });
    const contributors = [contrib];

    const result = minBibliographic([contrib, contributors]);
    assert.equal(result, false);
});

test('can update bibliographic field on contributor if there is another bib contrib', function(assert) {
    const contrib = EmberObject.create({
        id: '12345',
        permission: 'admin',
        unregisteredContributor: null,
        bibliographic: true,

    });

    const otherContrib = EmberObject.create({
        id: 'abcde',
        permission: 'read',
        bibliographic: true,
    });
    const contributors = [contrib, otherContrib];

    const result = minBibliographic([contrib, contributors]);
    assert.equal(result, true);
});

test('cannot update bibliographic field if no other bibliographic contributors', function(assert) {
    const contrib = EmberObject.create({
        id: '12345',
        permission: 'admin',
        unregisteredContributor: null,
        bibliographic: true,

    });

    const otherContrib = EmberObject.create({
        id: 'abcde',
        permission: 'read',
        bibliographic: false,
    });
    const contributors = [contrib, otherContrib];

    const result = minBibliographic([contrib, contributors]);
    assert.equal(result, false);
});
