import Ember from 'ember';
import buildProviderAssetPath from '../utils/build-provider-asset-path';

export default Ember.Helper.extend({
    theme: Ember.inject.service(),
    compute(params) {
        let [providerId, assetName] = params;
        return buildProviderAssetPath(providerId, assetName, this.get('theme.isDomain'));
    }
});
