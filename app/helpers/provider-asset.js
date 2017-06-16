import Ember from 'ember';
import config from 'ember-get-config';
import buildProviderAssetPath from '../utils/build-provider-asset-path';

export default Ember.Helper.extend({
    theme: Ember.inject.service(),
    compute(params) {
        let [providerId, assetName] = params;
        return buildProviderAssetPath(config, providerId, assetName, this.get('theme.isDomain'));
    }
});
