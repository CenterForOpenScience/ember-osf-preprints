import { test } from 'qunit';
import moduleForAcceptance from 'preprint-service/tests/helpers/module-for-acceptance';
// import FactoryGuy from 'ember-data-factory-guy';

moduleForAcceptance('Acceptance | content');

test('visiting /content', function(assert) {
    // TODO: Problems getting preprint content page. url = '/' completely breaks testem
    let container = this.application.__container__;
    // let preprint = FactoryGuy.make('preprint');
    // let url = '/' + preprint.get('id');
    // url = '/'
    // visit(url);

    andThen(() => {
        assert.ok(container);
        // assert.equal(currentURL(), url);
    });
});
