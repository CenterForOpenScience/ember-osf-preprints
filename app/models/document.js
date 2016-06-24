import DS from 'ember-data';
import JamModel from '../mixins/jam-model';

export default DS.Model.extend(JamModel, {
    attributes: DS.attr(),
    tree: DS.attr(),
    collection: DS.belongsTo('collection'),
//    history: DS.hasMany('history', {async: true})
});
