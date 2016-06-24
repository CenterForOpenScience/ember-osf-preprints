import JSONAPISerializer from 'ember-data/serializers/json-api';

export default JSONAPISerializer.extend({
    // Suppress fields that should not be sent to the server
    attrs: {
        createdOn: {serialize: false},
        createdBy: {serialize: false},
        modifiedOn: {serialize: false},
        modifiedBy: {serialize: false}
    },

  normalize(model, payload) {
    payload.attributes = Object.assign({}, payload.meta, {attributes: payload.attributes});
    return this._super(model, payload);
  },

  serialize(snapshot, options) {
    var data = this._super(snapshot, options);
    data.data.attributes = data.data.attributes.attributes;
    return data;
  }
});
