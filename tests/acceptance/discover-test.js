import { test } from 'qunit';
import Ember from 'ember';
import moduleForAcceptance from 'preprint-service/tests/helpers/module-for-acceptance';
import FactoryGuy, { manualSetup } from 'ember-data-factory-guy';
import config from 'ember-get-config';
import FakeServer, { stubRequest } from 'ember-cli-fake-server';

moduleForAcceptance('Acceptance | discover', {
    beforeEach: function() {
        let container = this.application.__container__;
        manualSetup(container);

            stubRequest('post', config.SHARE.searchUrl, (request) => {
                request.ok({
                    aggregations: {
                        sources: {
                            buckets: [
                                {key: 'arXiv', doc_count: 12000},
                                {key: 'psyarxiv', doc_count: 10}
                            ]
                        }
                    }, hits: {total: 1, hits: [{
                        _id: 'Welp',
                        _source: {
                            subjects: [],
                            sources: [],
                            identifiers: [],
                            lists: {
                                contributors: []
                            }
                        }
                    }]}
                });
            });
    }
});

test('visiting /discover', function(assert) {
    visit('preprints/discover');
    andThen(() => assert.equal(currentURL(), '/preprints/discover?provider=&subject='));
});
test('visit discover with queryParams', function(assert) {
    let container = this.application.__container__;
    visit('preprints/discover?provider=arxiv');
    andThen(() => {
        let controller = container.lookup('controller:discover');
        let providers = controller.activeFilters.providers;
        let subjects = controller.activeFilters.subjects;

        andThen(() => {
            debugger;
            assert.ok(providers.indexOf('OSF') !== -1);
            assert.equal(providers.length, 1);

            assert.ok(subjects.indexOf('Business') !== -1);
            assert.equal(subjects.length, 1);

            assert.equal(currentURL(), 'preprints/discover?provider=OSF&subject=Business');
        })
    });
})
