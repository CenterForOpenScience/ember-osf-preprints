import Ember from 'ember';

import config from '../config/environment';

// TODO: May add this to ember-osf in future once requirements better fleshed out
/**
 * @module ember-preprints
 * @submodule utils
 * @returns {boolean}
 */

/**
 * Utilities for saving and fetching analytics information
 *
 * @class analytics
 */

function _keenQuery(accessKey, extraPayload) {
    let payload = Object.assign({ group_by: 'action.type' }, extraPayload);
    // TODO: Provide abstraction later when we have a better sense of possible urls
    let url = `https://api.keen.io/3.0/projects/${config.ANALYTICS.keenProjectId}/queries/count`;
    let jqDeferred = Ember.$.ajax({
        url,
        method: 'POST',
        data: JSON.stringify(payload),
        contentType: 'application/json',
        headers: {
            Authorization: accessKey,
        },
        crossDomain: true,
    });
    // TODO: deduplicate this bit
    return new Ember.RSVP.Promise((resolve, reject) => {
        jqDeferred.done((value) => resolve(value));
        jqDeferred.fail((reason) => reject(reason));
    });
}

/**
 * Get information about a specific file under a specific project in keen
 * @param filePath {String} The path to the file, eg `/<longId>`
 * @param accessKey
 * @param options {Object} Support additional configuration options such as provider name
 * @returns {Object} Dict of {actionType: result} entries
 */
function getKeenFileCounts(filePath, accessKey, options={}) {  // jshint ignore:line
    let payload = {
        // Despite what the docs claim, Keen requires a timeframe. Set it to all.
        timeframe: {
            start: new Date(0),
            end: new Date()
        },
        event_collection: 'file_stats',
        filters: [{
            property_name: 'file.path',
            operator: 'eq',
            property_value: filePath,
        }, {
            property_name: 'file.provider',
            operator: 'eq',
            property_value: options.provider || 'osfstorage'
        }]
    };
    let results = {};
    return _keenQuery(accessKey, payload).then((data) => {
        let res = data.result || [];
        res.forEach((item)=> results[item['action.type']] = item.result);
        return results;
    });
}

export { getKeenFileCounts };

