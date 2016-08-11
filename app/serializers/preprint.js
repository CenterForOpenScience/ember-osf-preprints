import OsfSerializer from 'ember-osf/serializers/osf-serializer';

export default OsfSerializer.extend({
    serialize(snapshot) {
        // Normal OSF serializer strips out relationships. We need to add back primaryFile for this endpoint
        let res = this._super(...arguments);
        res.data.relationships = {
            // Not sure what the name of this key comes from, but it's required.
            preprint_file: {
                data: {
                    id: snapshot.belongsTo('primaryFile', { id: true }),
                    type: 'primary_file'
                }
            }
        };
        return res;
    }

});
