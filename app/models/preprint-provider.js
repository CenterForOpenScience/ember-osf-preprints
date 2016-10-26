import DS from 'ember-data';
import OsfModel from 'ember-osf/models/osf-model';

export default OsfModel.extend({
    name: DS.attr('string'),
    logoPath: DS.attr('string'),
    bannerPath: DS.attr('string'),
    description: DS.attr('string'),
    advisoryBoard: DS.attr('string'),
    emailContact: DS.attr('string'),
    emailSupport: DS.attr('string'),
    socialTwitter: DS.attr('string'),
    socialFacebook: DS.attr('string'),
    socialInstagram: DS.attr('string'),
    headerText: DS.attr('string'),
    subjectsAcceptable: DS.attr(),
    // Relationships
    taxonomies: DS.hasMany('taxonomy'),
    preprints: DS.hasMany('preprint', { inverse: 'provider', async: true }),
});
