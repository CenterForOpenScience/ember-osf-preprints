import fileDownloadPath from 'preprint-service/utils/file-download-path';
import { module, test } from 'qunit';
import Ember from 'ember';
import config from 'ember-get-config';

const osfUrl = config.OSF.url;

module('Unit | Utility | file download path');

test('No arguments should return undefined', function(assert) {
    const result = fileDownloadPath();
    assert.ok(typeof result === 'undefined');
});

test('with file guid', function(assert) {
    const file = Ember.Object.create({
        guid: 'abc12',
        path: 'blah'
    });

    const node = Ember.Object.create({
        id: 'def34'
    });

    const result = fileDownloadPath(file, node);

    assert.strictEqual(result, `${osfUrl}abc12/?action=download`);
});

test('without file guid', function(assert) {
    const file = Ember.Object.create({
        path: '/blah'
    });

    const node = Ember.Object.create({
        id: 'def34'
    });

    const result = fileDownloadPath(file, node);

    assert.strictEqual(result, `${osfUrl}project/def34/files/osfstorage/blah/?action=download`);
});

test('file guid with version', function(assert) {
    const file = Ember.Object.create({
        guid: 'abc12',
        path: '/blah'
    });

    const node = Ember.Object.create({
        id: 'def34'
    });

    const result = fileDownloadPath(file, node, 4);

    assert.strictEqual(result, `${osfUrl}abc12/?action=download&version=4`);
});

test('without file guid', function(assert) {
    const file = Ember.Object.create({
        path: '/blah'
    });

    const node = Ember.Object.create({
        id: 'def34'
    });

    const result = fileDownloadPath(file, node, 7);

    assert.strictEqual(result, `${osfUrl}project/def34/files/osfstorage/blah/?action=download&version=7`);
});
