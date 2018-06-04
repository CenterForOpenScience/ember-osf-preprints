import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

/**
 * @module ember-preprints
 * @submodule helpers
 */

/**
  * DO NOT USE THIS HELPER ON USER-ENTERED TEXT!!!
  * safeMarkup helper. Returns a string that will not be HTML escaped by Handlebars.
  *
  * @class safe-markup
  * @param {string} string
  * @return {Object} Returns Handlebars.SafeString
  */
export function safeMarkup(params/* , hash */) {
    return htmlSafe(params.join(''));
}

export default helper(safeMarkup);
