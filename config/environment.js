/* jshint node: true */

module.exports = function(environment) {
    var authorizationType = 'cookie';

    var ENV = {
        KEEN: {
            private: {
                projectId: 'process.env.PREPRINTS_PRIVATE_PROJECT_ID',
                writeKey: 'process.env.PREPRINTS_PRIVATE_WRITE_KEY'
            },
            public: {
                projectId: 'process.env.PREPRINTS_PUBLIC_PROJECT_ID',
                writeKey: 'process.env.PREPRINTS_PUBLIC_WRITE_KEY'
            }
        },
        modulePrefix: 'preprint-service',
        environment: environment,
        rootURL: '/',
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
            searchUrl: process.env.SHARE_SEARCH_URL || 'https://staging-share.osf.io/api/v2/search/creativeworks/_search'
        },
        moment: {
            outputFormat: 'YYYY-MM-DD hh:mm a'
        },
        PREPRINTS: {
            defaultProvider: 'osf',


            // Logos are needed for open graph sharing meta tags (Facebook, LinkedIn, etc) and must be at least 200x200
            providers: [
                {
                    id: 'osf',
                    logoSharing: {
                        path: '/assets/img/provider_logos/osf-dark.png',
                        type: 'image/png',
                        width: 363,
                        height: 242
                    },
                    permissionLanguage: 'no_trademark'
                },
                {
                    id: 'engrxiv',
                    logoSharing: {
                        path: '/assets/img/provider_logos/engrxiv-sharing.png',
                        type: 'image/png',
                        width: 1200,
                        height: 488

                    },
                    permissionLanguage: 'arxiv_non_endorsement'

                },
                {
                    id: 'psyarxiv',
                    logoSharing: {
                        path: '/assets/img/provider_logos/psyarxiv-sharing.png',
                        type: 'image/png',
                        width: 1200,
                        height: 488
                    },
                    permissionLanguage: 'arxiv_non_endorsement'
                },
                {
                    id: 'socarxiv',
                    logoSharing: {
                        path: '/assets/img/provider_logos/socarxiv-sharing.png',
                        type: 'image/png',
                        width: 1200,
                        height: 488
                    },
                    permissionLanguage: 'arxiv_trademark_license'
                },
                {
                    id: 'scielo',
                    logoSharing: {
                        path: '/assets/img/provider_logos/scielo-logo.png',
                        type: 'image/png',
                        width: 1200,
                        height: 488
                    },
                    permissionLanguage: 'no_trademark'
                },
                {
                    id: 'agrixiv',
                    logoSharing: {
                        path: 'assets/img/provider_logos/agrixiv-banner.svg',
                        type: 'image/png',
                        width: 1200,
                        height: 488
                    },
                    permissionLanguage: 'arxiv_non_endorsement'
                }
            ],
        },
        i18n: {
            defaultLocale: 'en'
        },
        metricsAdapters: [
            {
                name: 'GoogleAnalytics',
                environments: ['all'],
                config: {
                    id: process.env.GOOGLE_ANALYTICS_ID
                }
            }
        ],
        FB_APP_ID: process.env.FB_APP_ID,
    };

    if (environment === 'development') {
        // ENV.APP.LOG_RESOLVER = true;
        // ENV.APP.LOG_ACTIVE_GENERATION = true;
        // ENV.APP.LOG_TRANSITIONS = true;
        // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
        // ENV.APP.LOG_VIEW_LOOKUPS = true;

        ENV.metricsAdapters[0].config.cookieDomain = 'none'
    }

    if (environment === 'test') {
        // Testem prefers this...
        ENV.baseURL = '/';
        ENV.locationType = 'none';

        // keep test console output quieter
        ENV.APP.LOG_ACTIVE_GENERATION = false;
        ENV.APP.LOG_VIEW_LOOKUPS = false;

        ENV.APP.rootElement = '#ember-testing';

        // Don't make external requests during unit test
        // TODO: Provide mocks for all components with manual AJAX calls in the future.
        ENV.SHARE.baseUrl = '/nowhere';
        ENV.SHARE.searchUrl = '/nowhere';

        ENV.metricsAdapters[0].config.cookieDomain = 'none'
    }

    if (environment === 'production') {
        ENV.sentryDSN = process.env.SENTRY_DSN || 'https://2f0a61d03b99480ea11e259edec18bd9@sentry.cos.io/45';
        ENV.ASSET_SUFFIX = process.env.GIT_COMMIT || 'git_commit_env_not_set';
    } else {
        // Fallback to throwaway defaults if the environment variables are not set
        ENV.metricsAdapters[0].config.id = ENV.metricsAdapters[0].config.id || 'UA-84580271-1';
        ENV.FB_APP_ID = ENV.FB_APP_ID || '1039002926217080';
    }

    if (ENV.ASSET_SUFFIX) {
        ENV.PREPRINTS.providers = ENV.PREPRINTS.providers.map(provider => {
            provider.logoSharing.path = provider.logoSharing.path
                .replace(/\..*$/, match => `-${ENV.ASSET_SUFFIX}${match}`);

            return provider;
        });
    }

    return ENV;
};
