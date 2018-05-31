import { permissionMap } from 'preprint-service/helpers/permission-map';
import { module, test } from 'qunit';

module('Unit | Helper | permission map');

test('read maps to Read', function(assert) {
    const result = permissionMap(['read']);
    assert.equal(result, 'Read');
});

test('write maps to Read + Write', function(assert) {
    const result = permissionMap(['write']);
    assert.equal(result, 'Read + Write');
});

test('admin maps to Administrator', function(assert) {
    const result = permissionMap(['admin']);
    assert.equal(result, 'Administrator');
});
