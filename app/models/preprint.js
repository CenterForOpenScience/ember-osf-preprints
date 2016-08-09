import DS from 'ember-data';
import OsfModel from 'ember-osf/models/osf-model';


/**
 * @module ember-preprints
 * @submodule models
 */

/**
 * Model for OSF APIv2 preprints. This model may be used with one of several API endpoints. It may be queried directly,
 *  or accessed via relationship fields.
 * For field and usage information, see:
 * https://api.osf.io/v2/docs/#!/v2/Preprint_List_GET
 * https://api.osf.io/v2/docs/#!/v2/Preprint_Detail_GET
 * https://api.osf.io/v2/docs/#!/v2/User_Preprints_GET
 * @class Preprint
 */
export default OsfModel.extend({
    title: DS.attr('string'),
    subjects: DS.attr(),
    provider: DS.attr('string'),
    date_created: DS.attr('date'),
    date_modified: DS.attr('date'),
    abstract: DS.attr('string'),
    tags: DS.attr(),


    // Relationships:
    // 1. Primary file
    // 2. files
    // 3. Authors (basically contributors)

    primaryFile: DS.belongsTo('file'),
    files: DS.hasMany('file-provider'),

    // REALLY BIG TODO: All preprints must re-implement all contributors behavior from the node model (authors are contributors by another name)
    authors: DS.hasMany('authors', {
        allowBulkUpdate: true,
        allowBulkRemove: true,
        inverse: null
    }),

    // authors: DS.attr(),
    // date: DS.attr(),
    // abstract: DS.attr(),
    // publisher: DS.attr(),
    // project: DS.attr(),
    // supplementalMaterials: DS.attr(),
    // figures: DS.attr(),
    // license: DS.attr(),
    // path: DS.attr(),
    // tags: DS.attr(),
    // doi: DS.attr(),
});
