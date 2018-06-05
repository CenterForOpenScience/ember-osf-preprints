/* eslint-env node */

module.exports = function(environment) {
    const authorizationType = 'cookie';

    const ENV = {
        modulePrefix: 'preprint-service',
        appName: 'Preprints',
        environment,
        rootURL: '/',
        locationType: 'auto',
        authorizationType,
        'ember-simple-auth': {
            authorizer: `authorizer:osf-${authorizationType}`,
            authenticator: `authenticator:osf-${authorizationType}`,
        },
        // Set to 'local' to use local assets at providerAssetsPath.
        providerAssetsURL: process.env.PROVIDER_ASSETS_URL || 'https://staging-cdn.osf.io/preprints-assets/',
        // path to local preprint provider assets (relative to public/assets/)
        providerAssetsPath: 'osf-assets/files/preprints-assets',
        EmberENV: {
            FEATURES: {
                // Here you can enable experimental features on an ember canary build
                // e.g. 'with-controller': true
            },
        },
        APP: {
            // Here you can pass flags/options to your application instance
            // when it is created
        },
        SHARE: {
            baseUrl: process.env.SHARE_BASE_URL || 'https://staging-share.osf.io/',
            searchUrl: process.env.SHARE_SEARCH_URL || 'https://staging-share.osf.io/api/v2/search/creativeworks/_search',
        },
        moment: {
            outputFormat: 'YYYY-MM-DD hh:mm a',
        },
        PREPRINTS: {
            defaultProvider: 'osf',
        },
        i18n: {
            defaultLocale: 'en',
        },
        metricsAdapters: [
            {
                name: 'GoogleAnalytics',
                environments: [process.env.KEEN_ENVIRONMENT] || ['production'],
                config: {
                    id: process.env.GOOGLE_ANALYTICS_ID,
                },
            },
            {
                name: 'Keen',
                environments: [process.env.KEEN_ENVIRONMENT] || ['production'],
                config: {
                    private: {
                        projectId: process.env.PREPRINTS_PRIVATE_PROJECT_ID,
                        writeKey: process.env.PREPRINTS_PRIVATE_WRITE_KEY,
                    },
                    public: {
                        projectId: process.env.PREPRINTS_PUBLIC_PROJECT_ID,
                        writeKey: process.env.PREPRINTS_PUBLIC_WRITE_KEY,
                    },
                },
            },

        ],
        FB_APP_ID: process.env.FB_APP_ID,
        whiteListedProviders: [
            'arXiv',
            'bioRxiv',
            'Cogprints',
            'PeerJ',
            'Research Papers in Economics',
            'Preprints.org',
        ],
        // Sentry/Raven config options
        sentry: {
            dsn: 'http://test@localhost/80' || process.env.SENTRY_DSN,
            debug: true,
            development: true,
            globalErrorCatching: false,
            ravenOptions: {
                release: process.env.GIT_COMMIT,
            },
        },
        contentSecurityPolicy: {
            'script-src': "'self' 'unsafe-inline' 'unsafe-eval'",
        },
    };

    if (environment === 'development') {
        // ENV.APP.LOG_RESOLVER = true;
        // ENV.APP.LOG_ACTIVE_GENERATION = true;
        // ENV.APP.LOG_TRANSITIONS = true;
        // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
        // ENV.APP.LOG_VIEW_LOOKUPS = true;

        ENV.metricsAdapters[0].config.cookieDomain = 'none';
    }

    if (environment === 'test') {
        ENV.APP.autoboot = false;

        // keep test console output quieter
        ENV.APP.LOG_ACTIVE_GENERATION = false;
        ENV.APP.LOG_VIEW_LOOKUPS = false;

        ENV.APP.rootElement = '#ember-testing';

        // Don't make external requests during unit test
        // TODO: Provide mocks for all components with manual AJAX calls in the future.
        ENV.SHARE.baseUrl = '/nowhere';
        ENV.SHARE.searchUrl = '/nowhere';
        ENV.OSF = {};
        ENV.OSF.shareSearchUrl = '/nowhere';

        ENV.metricsAdapters[0].config.cookieDomain = 'none';
    }

    if (environment === 'production') {
        ENV.sentry.dsn = process.env.SENTRY_DSN || 'https://2f0a61d03b99480ea11e259edec18bd9@sentry.cos.io/45';
        ENV.sentry.globalErrorCatching = true;
        ENV.sentry.development = false;
        ENV.sentry.debug = false;
        ENV.ASSET_SUFFIX = process.env.GIT_COMMIT || 'git_commit_env_not_set';
    } else {
        // Fallback to throwaway defaults if the environment variables are not set
        ENV.metricsAdapters[0].config.id = ENV.metricsAdapters[0].config.id || 'UA-84580271-1';
        ENV.FB_APP_ID = ENV.FB_APP_ID || '1039002926217080';
    }

    ENV.APP.LOG_VIEW_LOOKUPS = true;

    return ENV;
};
