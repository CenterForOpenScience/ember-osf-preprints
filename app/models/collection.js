import DS from 'ember-data';
import JamModel from '../mixins/jam-model';

export default DS.Model.extend(JamModel, {
    name: function() {
      return this.get('id').split('.')[1];
    }.property(),
    permissions: DS.attr(),
    namespace: DS.belongsTo('namespace'),
    documents: DS.hasMany('document', {async: true}),
});
