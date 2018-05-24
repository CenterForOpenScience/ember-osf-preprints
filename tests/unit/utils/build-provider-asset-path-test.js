import buildProviderAssetPath from 'preprint-service/utils/build-provider-asset-path';
import { module, test } from 'qunit';

module('Unit | Utility | build provider asset path');

test('build correct CDN path for domain', function(assert) {
    const config = {
        providerAssetsURL: 'cdn-url',
    };
    const result = buildProviderAssetPath(config, 'foo', 'bar.baz', true);
    assert.equal(result, `${config.providerAssetsURL}/foo/bar.baz`);
});

test('build correct CDN path for non-domain', function(assert) {
    const config = {
        providerAssetsURL: 'cdn-url',
    };
    const result = buildProviderAssetPath(config, 'foo', 'bar.baz', false);
    assert.equal(result, `${config.providerAssetsURL}/foo/bar.baz`);
});

test('build correct local path for domain', function(assert) {
    const config = {
        providerAssetsURL: 'local',
        providerAssetsPath: 'path/to/assets',
    };
    const result = buildProviderAssetPath(config, 'foo', 'bar.baz', true);
    assert.equal(result, `/assets/${config.providerAssetsPath}/foo/bar.baz`);
});

test('build correct local path for non-domain', function(assert) {
    const config = {
        providerAssetsURL: 'local',
        providerAssetsPath: 'path/to/assets',
    };
    const result = buildProviderAssetPath(config, 'foo', 'bar.baz', false);
    assert.equal(result, `/preprints/assets/${config.providerAssetsPath}/foo/bar.baz`);
});

test('build correct local path with fingerprint for domain', function(assert) {
    const config = {
        providerAssetsURL: 'local',
        providerAssetsPath: 'path/to/assets',
        ASSET_SUFFIX: 'deadbeef',
    };
    const result = buildProviderAssetPath(config, 'foo', 'bar.baz', true);
    assert.equal(result, `/assets/${config.providerAssetsPath}/foo/bar-${config.ASSET_SUFFIX}.baz`);
});

test('build correct local path with finderprint for non-domain', function(assert) {
    const config = {
        providerAssetsURL: 'local',
        providerAssetsPath: 'path/to/assets',
        ASSET_SUFFIX: 'deadbeef',
    };
    const result = buildProviderAssetPath(config, 'foo', 'bar.baz', false);
    assert.equal(result, `/preprints/assets/${config.providerAssetsPath}/foo/bar-${config.ASSET_SUFFIX}.baz`);
});
