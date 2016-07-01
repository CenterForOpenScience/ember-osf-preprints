import Ember from 'ember';
import attr from 'ember-data/attr';

export default Ember.Mixin.create({
    // Fields found in meta
    createdOn: attr('date'),
    modifiedOn: attr('date'),
    createdBy: attr('string'),
    modifiedBy: attr('string')
});
