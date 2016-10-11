import OsfSerializer from 'ember-osf/serializers/osf-serializer';

export default OsfSerializer.extend({
    serialize(snapshot) {
        // Normal OSF serializer strips out relationships. We need to add back primaryFile for this endpoint
        let res = this._super(...arguments);
        res.data.relationships = {
            primary_file: {
                data: {
                    id: snapshot.belongsTo('primaryFile', { id: true }),
                    type: 'files'
                }
            },
            node: {
                data: {
                    id: snapshot.belongsTo('node', { id: true}),
                    type: 'nodes'
                }
            },
            provider: {
                data: {
                    id: 'osf',
                    type: 'preprint-providers'
                }
            }
        };

        if (res.data.attributes)
            // TODO: This should not be in the serializer. It is the responsibility of the person creating a record to give the correct data format.
            res.data.attributes.subjects = (snapshot.record.get('subjects') || []).map(subjectBlock => subjectBlock.map(subject => subject.get('id')));

        return res;
    }

});
