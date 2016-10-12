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
    // TODO: May be a relationship in the future pending APIv2 changes
    subjects: DS.attr(),
    dateCreated: DS.attr('date'),
    datePublished: DS.attr('date'),
    doi: DS.attr('string'),
    isPublished: DS.attr('boolean'),
    isPreprintOrphan: DS.attr('boolean'),

    // Relationships
    node: DS.belongsTo('node', { inverse: null, async: false}),
    primaryFile: DS.belongsTo('file', { inverse: null }),
    provider: DS.belongsTo('preprint-provider', { inverse: 'preprints', async: true }),
});
