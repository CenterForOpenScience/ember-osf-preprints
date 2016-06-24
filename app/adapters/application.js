import JSONAPIAdapter from 'ember-data/adapters/json-api';

import JamDocumentAdapter from '../mixins/jam-document-adapter';

import UrlTemplates from 'ember-data-url-templates';
import config from 'ember-get-config';

export default JSONAPIAdapter.extend(JamDocumentAdapter, UrlTemplates, {
    host: config.JamDB.url,
    namespace: 'v1/id',

    urlSegments: {  // Make available to all adapters, not just documents. This appears to be extended rather than overwritten by children.
        namespaceId: () => config.JamDB.namespace
    }
});
