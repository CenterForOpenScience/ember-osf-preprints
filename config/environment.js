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
        // sentryDSN: 'http://test@localhost/80' || process.env.sentryDSN,
        sentryDSN: null,
        sentryOptions: {
            release: process.env.GIT_COMMIT,
            ignoreErrors: [
                // https://github.com/emberjs/ember.js/issues/12505
                'TransitionAborted',
            ],
        },
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
                environments: [process.env.KEEN_ENVIRONMENT || 'production'],
                config: {
                    id: process.env.GOOGLE_ANALYTICS_ID,
                    setFields: {
                        // Ensure the IP address of the sender will be anonymized.
                        anonymizeIp: true,
                    },
                },
                dimensions: {
                    authenticated: 'dimension1',
                    resource: 'dimension2',
                    isPublic: 'dimension3',
                    isWithdrawn: 'dimension4',
                    version: 'dimension5',
                },
            },
        ],
        FB_APP_ID: process.env.FB_APP_ID,
        chronosProviders: [
        ],
        approvedChronosJournalIds: [
            '0147-7307',
            '1099-9809',
            '1948-1985',
            '1984-3054',
            '1082-989X',
            '2160-4134',
            '1196-1961',
        ],
        plauditWidgetUrl: 'https://osf-review.plaudit.pub/embed/endorsements.js',
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
        ENV.sentryDSN = process.env.SENTRY_DSN || 'https://2f0a61d03b99480ea11e259edec18bd9@sentry.cos.io/45';
        ENV.ASSET_SUFFIX = process.env.GIT_COMMIT || 'git_commit_env_not_set';
    } else {
        // Fallback to throwaway defaults if the environment variables are not set
        ENV.metricsAdapters[0].config.id = ENV.metricsAdapters[0].config.id || 'UA-84580271-1';
        ENV.FB_APP_ID = ENV.FB_APP_ID || '1039002926217080';
    }

    ENV.APP.LOG_VIEW_LOOKUPS = true;

    return ENV;
};
