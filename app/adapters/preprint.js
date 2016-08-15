import OsfAdapter from 'ember-osf/adapters/osf-adapter';

// TODO: This is an OSF apiv2 endpoints, and should be moved to the ember-osf addon.
export default OsfAdapter.extend({
    urlForCreateRecord(modelName, snapshot) {
        // Preprints are posted to /preprints/<guid_of_source_node>/
        // Constructing the appropriate URL thus depends on passing an extra ID param when creating the record
        let url = this._super(...arguments);
        return `${url}/${snapshot.id}/`;
    }
});
