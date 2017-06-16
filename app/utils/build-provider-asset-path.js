import config from 'ember-get-config';
import pathJoin from '../utils/path-join';

export default function buildProviderAssetPath(providerId, assetName, isDomain) {
    if (config.providerAssetsURL != 'local') {
        return pathJoin(config.providerAssetsURL, providerId, assetName);
    }
    if (config.ASSET_SUFFIX) {
        assetName = assetName.replace(/\.[^\.]+$/, `-${config.ASSET_SUFFIX}$&`);
    }
    const providerAssetPath = 'assets/osf-assets/files/preprints-assets';
    if (isDomain) {
        return pathJoin('/', providerAssetPath, providerId, assetName);
    }
    return pathJoin('/preprints', providerAssetPath, providerId, assetName);
}
