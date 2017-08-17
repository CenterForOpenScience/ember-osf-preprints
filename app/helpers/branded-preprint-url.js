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

export function brandedPreprintUrl(provider, lightLogo) {
    let url = '';
    if (provider[0].get('domain') && provider[0].get('domainRedirectEnabled')) {
        url = lightLogo.type ? provider[0].get('domain') : pathJoin(provider[0].get('domain'), 'discover');
    } else {
        url = lightLogo.type ? '/preprints/' + provider[0].get('id') : '/preprints/' + provider[0].get('id') + '/discover';
    }
    return url;
}

export default Ember.Helper.helper(brandedPreprintUrl);
