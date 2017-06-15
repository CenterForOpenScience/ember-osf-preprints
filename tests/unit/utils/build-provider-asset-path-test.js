import config from 'ember-get-config';
import buildProviderAssetPath from 'preprint-service/utils/build-provider-asset-path';
import { module, test } from 'qunit';

module('Unit | Utility | build provider asset path');

test('build correct path for domain', function(assert) {
    let result = buildProviderAssetPath('foo', 'bar.baz', true);
    assert.equal(result, `${config.providerAssetsURL}foo/bar.baz`);
});

test('build correct path for non-domain', function(assert) {
    let result = buildProviderAssetPath('foo', 'bar.baz', false);
    assert.equal(result, `${config.providerAssetsURL}foo/bar.baz`);
});
