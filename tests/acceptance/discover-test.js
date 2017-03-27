import { test } from 'qunit';
import moduleForAcceptance from 'preprint-service/tests/helpers/module-for-acceptance';
import FactoryGuy, { manualSetup } from 'ember-data-factory-guy';
import config from 'ember-get-config';
import FakeServer, { stubRequest } from 'ember-cli-fake-server';

moduleForAcceptance('Acceptance | discover');

test('visiting /discover', function(assert) {
    visit('preprints/discover');
    andThen(() => assert.equal(currentURL(), '/preprints/discover?provider=&subject='));
});

test('visit discover with queryParams', function(assert) {
    let container = this.application.__container__;
    manualSetup(container);
    const sub1 = FactoryGuy.build('taxonomy');
    const sub2 = FactoryGuy.build('taxonomy');

    stubRequest('post', config.SHARE.searchUrl, (request) => {
        request.ok({
            aggregations: {
                sources: {
                    buckets: [
                        {key: 'OSF', doc_count: 1000},
                        {key: 'arXiv', doc_count: 12000},
                        {key: 'psyarxiv', doc_count: 10}
                    ]
                }
            }, hits: { total: 1, hits: [
                _id: 'Welp',
                _source: {
                    subjects: [],
                    sources: [],
                    identifiers: [],
                    contributors: []
                }
            ]}
        });
    });
    stubRequest('get', config.OSF.apiUrl + '/v2/taxonomies/', (request) => {
        request.ok({data: [{
            attributes: sub1,
            type: "taxonomies",
            id: sub1.id
        }, {
            attributes: sub2,
            type: "taxonomies",
            id: sub2.id
        }]});
    });

    visit('preprints/discover?provider=OSF&subject=Business');


    andThen(() => {
        let controller = container.lookup('controller:discover');
        debugger;
        let providers = controller.activeFilters.providers;
        let subjects = controller.activeFilters.subjects;

        assert.ok(providers.indexOf('OSF') !== -1);
        assert.equal(providers.length, 1);

        assert.ok(subjects.indexOf('Business') !== -1);
        assert.equal(subjects.length, 1);

        assert.equal(currentURL(), 'preprints/discover?provider=OSF&subject=Business');
    });
});
