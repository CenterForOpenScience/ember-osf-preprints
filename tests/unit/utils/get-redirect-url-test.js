import getRedirectUrl from 'preprint-service/utils/get-redirect-url';
import { module, test } from 'qunit';

module('Unit | Utility | get redirect url');

function makeTest(slug, domain, protocol, host, pathname, expected) {
    return function(assert) {
        // Stub the location
        const location = {
            protocol,
            host,
            pathname,
            origin: `${protocol}//${host}`
        };

        const result = getRedirectUrl(location, domain, slug);
        assert.strictEqual(expected, result);
    };
}

const scenarios = [
    {
        prefix: 'Production-like',
        slug: 'test',
        domain: 'test.org',
        protocol: 'https:',
        host: 'osf.io'
    },
    {
        prefix: 'Localhost',
        slug: 'test',
        domain: 'local.test.org:4200',
        protocol: 'http:',
        host: 'localhost:5000'
    }
];

for (const {prefix, slug, domain, protocol, host} of scenarios) {
    const makeTestBound = makeTest.bind(null, slug, domain, protocol, host);
    const resultOrigin = `${protocol}//${domain}`;

    const cases = [
        {
            name: `${prefix}`,
            pathname: `/preprints/${slug}/`,
            expected: `${resultOrigin}/`
        },
        {
            name: `${prefix} with path`,
            pathname: `/preprints/${slug}/discover`,
            expected: `${resultOrigin}/discover`
        },
        {
            name: `${prefix} with GUID`,
            pathname: `/abc12`,
            expected: `${resultOrigin}/abc12`
        }
    ];

    for (const {name, pathname, expected} of cases) {
        test(
            name,
            makeTestBound(pathname, expected)
        );
    }
}
