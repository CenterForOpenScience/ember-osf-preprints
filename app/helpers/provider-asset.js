import { inject } from '@ember/service';
import Helper from '@ember/component/helper';
import config from 'ember-get-config';
import buildProviderAssetPath from '../utils/build-provider-asset-path';

export default Helper.extend({
    theme: inject(),
    compute(params) {
        let [providerId, assetName] = params;
        return buildProviderAssetPath(config, providerId, assetName, this.get('theme.isDomain'));
    }
});
