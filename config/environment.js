/* jshint node: true */

module.exports = function(environment) {
    var authorizationType = 'cookie';

    var ENV = {
        modulePrefix: 'preprint-service',
        environment: environment,
        rootURL: '/preprints/',
        locationType: 'auto',
        authorizationType: authorizationType,
        sentryDSN: 'http://test@localhost/80' || process.env.SENTRY_DSN,
        'ember-simple-auth': {
            authorizer: `authorizer:osf-${authorizationType}`,
            authenticator: `authenticator:osf-${authorizationType}`
        },
        EmberENV: {
            FEATURES: {
                // Here you can enable experimental features on an ember canary build
                // e.g. 'with-controller': true
            }
        },
        APP: {
            // Here you can pass flags/options to your application instance
            // when it is created
        },
        SHARE: {
            baseUrl: process.env.SHARE_BASE_URL || 'https://staging-share.osf.io/',
            searchUrl: process.env.SHARE_SEARCH_URL || 'https://staging-share.osf.io/api/v2/search/abstractcreativework/_search'
        },
        moment: {
            outputFormat: 'YYYY-MM-DD hh:mm a'
        },
        ANALYTICS: {
            // Keen Project ID, common across all nodes. Must be filled in!
            keenProjectId: null,
        },
        PREPRINTS: {
            provider: 'osf',
            // The name of the OSF campaign used to track signups
            campaign: 'osf-preprints'
        },
    };

    if (environment === 'development') {
        // ENV.APP.LOG_RESOLVER = true;
        // ENV.APP.LOG_ACTIVE_GENERATION = true;
        // ENV.APP.LOG_TRANSITIONS = true;
        // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
        // ENV.APP.LOG_VIEW_LOOKUPS = true;
    }

    if (environment === 'test') {
        // Testem prefers this...
        // ENV.baseURL = '/';
        ENV.locationType = 'none';

        // keep test console output quieter
        ENV.APP.LOG_ACTIVE_GENERATION = false;
        ENV.APP.LOG_VIEW_LOOKUPS = false;

        ENV.APP.rootElement = '#ember-testing';

        // Don't make external requests during unit test
        // TODO: Provide mocks for all components with manual AJAX calls in the future.
        ENV.SHARE.baseUrl = '/nowhere';
        ENV.SHARE.searchUrl = '/nowhere';
    }

    if (environment === 'production') {
        ENV.sentryDSN = process.env.SENTRY_DSN || 'https://2f0a61d03b99480ea11e259edec18bd9@sentry.cos.io/45';
        ENV.googleID = process.env.GOOGLE_ID || '123plschangeme';
    }

    return ENV;
};
