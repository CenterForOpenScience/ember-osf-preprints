import DS from 'ember-data';
import OsfModel from 'ember-osf/models/osf-model';

export default OsfModel.extend({
    name: DS.attr('string'),
    logo_path: DS.attr('string'),
    banner_path: DS.attr('string'),
    description: DS.attr('string'),
    advisory_board: DS.attr('string'),
    email_contact: DS.attr('string'),
    email_support: DS.attr('string'),
    social_twitter: DS.attr('string'),
    social_facebook: DS.attr('string'),
    social_instagram: DS.attr('string'),
    header_text: DS.attr('string'),
    // Relationships
    taxonomies: DS.hasMany('taxonomy'),
    preprints: DS.hasMany('preprint', { inverse: 'provider', async: true }),
});
