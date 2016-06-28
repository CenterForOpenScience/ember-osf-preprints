import DS from 'ember-data';
import JamModel from '../mixins/jam-model';

export default DS.Model.extend(JamModel, {
    permissions: DS.attr(),
    name: DS.attr('string'),
    // state: DS.attr('string'),
    // logger: DS.attr('string'),
    // storage: DS.attr('string'),
    createdOn: DS.attr('date'),
    collections: DS.hasMany('collection', {async: true}),
});
