import pathJoin from '../utils/path-join';

export default function buildProviderAssetPath(config, providerId, assetName, isDomain) {
    if (config.providerAssetsURL !== 'local') {
        return pathJoin(config.providerAssetsURL, providerId, assetName);
    }
    if (config.ASSET_SUFFIX) {
        assetName = assetName.replace(/\.[^.]+$/, `-${config.ASSET_SUFFIX}$&`);
    }
    if (isDomain) {
        return pathJoin('/assets', config.providerAssetsPath, providerId, assetName);
    }
    return pathJoin('/preprints/assets', config.providerAssetsPath, providerId, assetName);
}
