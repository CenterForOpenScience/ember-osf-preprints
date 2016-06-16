import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import Ember from 'ember';

export default Model.extend({
    preprintId: attr(),
    title: attr(),
    authors: attr(),
    date: attr(),
    subject: attr(),
    abstract: attr(),
    publisher: attr(),
    project: attr(),
    supplementalMaterials: attr(),
    figures: attr(),
    license: attr(),
});
