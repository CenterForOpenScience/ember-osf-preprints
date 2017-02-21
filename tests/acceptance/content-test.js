import { test } from 'qunit';
import moduleForAcceptance from 'preprint-service/tests/helpers/module-for-acceptance';
import FactoryGuy, { manualSetup } from 'ember-data-factory-guy';


moduleForAcceptance('Acceptance | content');

test('visiting /content', function(assert) {
    let preprint = FactoryGuy.build('preprint-service');
    let url = `/content/${preprint.get('id')}/`
    visit(url);

    andThen(function() {
        debugger;
        assert.equal(currentURL(), '/content');
    });
});
