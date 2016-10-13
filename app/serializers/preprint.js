import OsfSerializer from 'ember-osf/serializers/osf-serializer';
import Ember from 'ember';

export default OsfSerializer.extend({
    serialize(snapshot) {
        // Normal OSF serializer strips out relationships. We need to add back primaryFile/node/provider for this endpoint
        let res = this._super(...arguments);
        res.data.relationships = {};
        for (var rel in snapshot.record._dirtyRelationships) {
            let relationship = Ember.String.underscore(rel);
            let id = snapshot.belongsTo(rel, {id: true})
            res.data.relationships[relationship] = {
                data: {
                    id: id,
                    type: relTypes[rel]
                }
            };
        };

        if (res.data.attributes && 'subjects' in snapshot.record.changedAttributes())
            res.data.attributes.subjects = (snapshot.record.get('subjects') || []);
        return res;
    }

});

// Type mapping for preprint relationship fields
var relTypes = {
    primaryFile: 'files',
    node: 'nodes',
    provider: 'providers'
};
