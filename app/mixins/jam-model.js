import Ember from 'ember';
import attr from 'ember-data/attr';

export default Ember.Mixin.create({
    // Generic field for getting attributes of any document
    attributes: attr(),
    // Fields found in meta
    createdOn: attr('date'),
    modifiedOn: attr('date'),
    createdBy: attr('string'),
    modifiedBy: attr('string')
});
