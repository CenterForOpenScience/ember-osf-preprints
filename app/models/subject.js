import DS from 'ember-data';

export default DS.Model.extend({
    subject: DS.attr(),
    subjectid: DS.attr(),
    background: DS.attr()
});
