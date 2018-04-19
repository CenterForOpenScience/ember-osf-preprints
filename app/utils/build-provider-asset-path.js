import pathJoin from '../utils/path-join';

export default function buildProviderAssetPath(config, providerId, assetName, isDomain) {
    let newAssetName = assetName;
    if (config.providerAssetsURL !== 'local') {
        return pathJoin(config.providerAssetsURL, providerId, newAssetName);
    }
    if (config.ASSET_SUFFIX) {
        newAssetName = newAssetName.replace(/\.[^.]+$/, `-${config.ASSET_SUFFIX}$&`);
    }
    if (isDomain) {
        return pathJoin('/assets', config.providerAssetsPath, providerId, newAssetName);
    }
    return pathJoin('/preprints/assets', config.providerAssetsPath, providerId, newAssetName);
}
