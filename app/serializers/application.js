import JSONAPISerializer from 'ember-data/serializers/json-api';

var dasherize = Ember.String.dasherize;

export default JSONAPISerializer.extend({
    modelName: null,

    // Suppress fields that should not be sent to the server
    attrs: {
        createdOn: {serialize: false},
        createdBy: {serialize: false},
        modifiedOn: {serialize: false},
        modifiedBy: {serialize: false}
    },

    normalize(model, payload) {
        payload.attributes = Object.assign({}, payload.meta, payload.attributes);
        return this._super(model, payload);
    },

    payloadKeyFromModelName: function(/*modelName */) {
        // JamDB expects all collections to specify JSONAPI type 'documents'
        return 'documents';
    },

    modelNameFromPayloadKey: function(key) {
        // Replace the generic JamDB response type of 'documents' with the name of the model to deserialize as
        return this.modelName || this._super(key);
    },

    keyForAttribute: function(attr /* method */) {
        // Override the default ember data behavior, so that Jam can use exactly the same keys as in the model (no dasherizing)
        return attr;
    },

    extractAttributes: function(modelClass, resourceHash) {
        // Merge meta attributes into the attributes available on model
        var attributes = this._super(...arguments);
        if (resourceHash.meta) {
            modelClass.eachAttribute((key) => {
                let attributeKey = dasherize(key);  // Unlike other payload fields, the ones in meta are dash-case
                if (resourceHash.meta.hasOwnProperty(attributeKey)) {
                    attributes[key] = resourceHash.meta[attributeKey];
                }
            });
        }
        return attributes;
    },

    extractId(modelClass, resourceHash) {
        return resourceHash.id.split('.')[resourceHash.id.split('.').length-1];
    },

    serialize(snapshot, options) {
        var data = this._super(snapshot, options);
//        data.data.attributes = data.data.attributes.attributes;
        return data;
    }
});
