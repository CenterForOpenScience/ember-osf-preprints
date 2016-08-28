import DS from 'ember-data';
import OsfModel from 'ember-osf/models/osf-model';

/**
 * @module ember-preprints
 * @submodule models
 */

/**
 * Model for OSF APIv2 preprints. This model may be used with one of several API endpoints. It may be queried directly. In the future, there will be multiple taxonomy endpoints under the same namespace.
 * For field and usage information, see:
 * https://api.osf.io/v2/docs/#!/v2/Plos_Taxonomy_GET
 * @class Taxonomy
 */
export default OsfModel.extend({
    text: DS.attr('string'),
    parents: DS.attr(),
});
