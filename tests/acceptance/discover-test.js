import { test } from 'qunit';
import moduleForAcceptance from 'preprint-service/tests/helpers/module-for-acceptance';
// import FakeServer, { stubRequest } from 'ember-cli-fake-server';

moduleForAcceptance('Acceptance | discover');

test('visiting /discover', function(assert) {
    visit('preprints/discover');
    andThen(() => assert.equal(currentURL(), '/preprints/discover?provider=&subject='));
});

test('visit discover with queryParams', function(assert) {
    let container = this.application.__container__;

    visit('preprints/discover?provider=OSF&subject=Business');

    andThen(() => {
        let controller = container.lookup('controller:discover');
        let providers = controller.activeFilters.providers;
        let subjects = controller.activeFilters.subjects;

        assert.ok(providers.indexOf('OSF') !== -1);
        assert.equal(providers.length, 1);

        assert.ok(subjects.indexOf('Business') !== -1);
        assert.equal(subjects.length, 1);

        assert.equal(currentURL(), 'preprints/discover?provider=OSF&subject=Business');
    });
});

//
// stubRequest('get', 'http://localhost:8000/v2/preprints' + url, (request) => {
//     request.ok(preprint.serialize());
// });
