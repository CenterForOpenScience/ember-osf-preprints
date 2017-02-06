import Ember from 'ember';

/**
 * @module ember-preprints
 * @module utils
 */

/**
 * @class elastic-escape
 */

/**
 * Backslash-escape characters with special meaning to elasticsearch, to prevent queries from failing
 *   https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#_reserved_characters
 * @method elasticEscape
 * @param {String} text
 * @return {*}
 */
function elasticEscape(text) {
    if (Ember.$.type(text) === 'string') {
        return text.replace(/[+\-=><!(){}\[\]^"~*?:\\/]|\&\&|\|\|/g, '\\$&');
    }
    return text;
}

export { elasticEscape };

