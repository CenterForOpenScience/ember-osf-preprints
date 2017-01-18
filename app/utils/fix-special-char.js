/**
 * @module ember-preprints
 * @submodule utils
 */

/**
 * @param {String} inputString
 * @returns {*}
 */
export default function fixSpecialChar(inputString) {
    return inputString ? inputString.replace(/&amp;/g, '&') : '';
}

export { fixSpecialChar };
