import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import JamModel from '../mixins/jam-model';

export default Model.extend(JamModel, {
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
    path: attr(),
    tags: attr(),
    doi: attr(),
});
