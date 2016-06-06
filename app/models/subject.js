import Model from 'ember-data/model';
import attr from 'ember-data/attr';

export default Model.extend({
  subject: attr(),
  sub_categories: attr(),
  photo: "This is a photo link"
});
