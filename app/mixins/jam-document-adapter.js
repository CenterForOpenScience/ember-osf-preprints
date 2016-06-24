import Ember from 'ember';

export default Ember.Mixin.create({
    updateRecordUrlTemplate: '{+host}/{+namespace}/documents{/namespaceId}.{collectionId}.{id}',
    findRecordUrlTemplate: '{+host}/{+namespace}/documents{/namespaceId}.{collectionId}.{id}',

    findAllUrlTemplate: '{+host}/{+namespace}/collections{/namespaceId}.{collectionId}/documents',
    createRecordUrlTemplate: '{+host}/{+namespace}/collections{/namespaceId}.{collectionId}/documents',

    queryUrlTemplate: '{+host}/{+namespace}/collections{/namespaceId}.{collectionId{/search}',
    queryRecordUrlTemplate: '{+host}/{+namespace}/collections{/namespaceId}.{collectionId{/search}',

    urlSegments: {
        // Allows serializer to be reused across multiple types
        search(type, id, snapshot, query) {
            return query.q ? '_search' : 'documents';
        },
        collectionId: (type) => Ember.Inflector.inflector.pluralize(type)
    },
    ajax: function(url, type, options={}) {
        options.traditional = true;
        return this._super(...arguments);
    }
});
