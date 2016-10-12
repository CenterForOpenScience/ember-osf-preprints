import OsfAdapter from 'ember-osf/adapters/osf-adapter';

// TODO: This is an OSF apiv2 endpoints, and should be moved to the ember-osf addon.
export default OsfAdapter.extend({
    buildURL(_, __, ___, requestType) {
        // Embed node
        var base = this._super(...arguments);
        if (['createRecord', 'updateRecord', 'deleteRecord'].indexOf(requestType) === -1) {
            return `${base}?embed=node`;
        } else {
            return base;
        }
    }
});
