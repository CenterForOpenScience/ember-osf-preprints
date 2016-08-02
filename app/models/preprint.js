import DS from 'ember-data';

export default DS.Model.extend({
    title: DS.attr('string'),
    authors: DS.attr(),
    date: DS.attr(),
    subject: DS.attr(),
    abstract: DS.attr(),
    publisher: DS.attr(),
    project: DS.attr(),
    supplementalMaterials: DS.attr(),
    figures: DS.attr(),
    license: DS.attr(),
    path: DS.attr(),
    tags: DS.attr(),
    doi: DS.attr(),
});
