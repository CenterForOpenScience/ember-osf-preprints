import { test } from 'qunit';
import moduleForAcceptance from 'preprint-service/tests/helpers/module-for-acceptance';
import FactoryGuy from 'ember-data-factory-guy';
import FakeServer, { stubRequest } from 'ember-cli-fake-server';

moduleForAcceptance('Acceptance | content');

test('visiting /content', function(assert) {
    let container = this.application.__container__;
    let preprint = FactoryGuy.make('preprint');
    // debugger;
    let url = '/' + preprint.get('id');
    url = '/'
    // stubRequest('get', 'http://localhost:8000/v2/preprints' + url, (request) => {
    //     request.ok(preprint.serialize());
    // });
    visit(url);

    andThen(() => {
        assert.equal(currentURL(), url);
    });
});
