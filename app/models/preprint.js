import Model from 'ember-data/model';
import attr from 'ember-data/attr';

export default Model.extend({
  title: attr(),
  abstract: attr(),
  authors: attr(),
  subject: attr(),
  journal: attr(),
  osf_project: attr(),
  date: attr()
});