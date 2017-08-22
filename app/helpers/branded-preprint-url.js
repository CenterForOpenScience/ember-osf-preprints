import Ember from 'ember';
import pathJoin from '../utils/path-join';

/**
 * @module ember-preprints
 * @submodule helpers
 */

/**
 * To determine the link url for branded preprints on the provider carousel
 *
 * @class route-prefix
 */

export function brandedPreprintUrl(params, hash) {
    let url = '';
    let [provider] = params;
    if (provider.get('domain') && provider.get('domainRedirectEnabled')) {
        url = provider.get('domain');
    } else {
        url = '/preprints/' + provider.get('id');
    }
    if (hash.path) {
        return pathJoin(url, hash.path);
    }
    return url;
}

export default Ember.Helper.helper(brandedPreprintUrl);
