/**
 * @module ember-preprints
 * @submodule utils
 */

export default function fixSpecialChar(inputString) {
   return inputString ? inputString.replace(/&amp;/g,"&").replace(/&gt;/g,">").replace(/&lt;/g,"<") : '';
 }

export { fixSpecialChar };
