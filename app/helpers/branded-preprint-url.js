import { helper } from '@ember/component/helper';
import pathJoin from '../utils/path-join';

/**
 * @module ember-preprints
 * @submodule helpers
 */

/**
  * To determine the link url for branded preprints on the provider carousel
  * Returns a string of the url with the necessary path
  *
  * @class brandedPreprintUrl
  * @param {Object[]} params all positional parameters.
  * @param {Object} params[0] The provider the url is being generated for.
  * @param {Object} hash all named parameters.
  * @param {String} hash.path The path to append.
  * @return {String} The url.
  */
export function brandedPreprintUrl(params, hash) {
    let url = '';
    const [provider] = params;
    if (provider.get('domain') && provider.get('domainRedirectEnabled')) {
        url = provider.get('domain');
    } else {
        url = `/preprints/${provider.get('id')}`;
    }
    if (hash.path) {
        return pathJoin(url, hash.path);
    }
    return url;
}

export default helper(brandedPreprintUrl);
