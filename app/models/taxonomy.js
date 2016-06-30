import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import JamModel from '../mixins/jam-model';

export default Model.extend(JamModel, {
  tree: attr()
});
