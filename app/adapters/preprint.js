import OsfAdapter from 'ember-osf/adapters/osf-adapter';

// TODO: This is an OSF apiv2 endpoints, and should be moved to the ember-osf addon.
export default OsfAdapter.extend({
    // Override _buildRelationshipURL on ember-osf.  Instead of relationship link, need a PATCH to self link
    _buildRelationshipURL: function _buildRelationshipURL(snapshot) {
        var url = null;
        if (snapshot.record.get('links.self')) {
            url = snapshot.record.get('links.self');
        }
        return url;
    },
    // Override _doRelatedRequest on ember-osf.  Need to serializer preprint instead of file.
    _doRelatedRequest: function _doRelatedRequest(store, snapshot, relatedSnapshots, relationship, url) {
            var isBulk = false;
            var serializer = store.serializerFor('preprint');
            var data = serializer.serialize(snapshot);

            return this.ajax(url, 'PATCH', {
                data: data,
                isBulk: isBulk
            });
        },

});
