import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import FactoryGuy, { manualSetup } from 'ember-data-factory-guy';

moduleForComponent('author-link', 'Integration | Component | author link', {
    integration: true
});

test('it renders', function(assert) {

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    manualSetup(this.container);
    let contributor = FactoryGuy.make('contributor');
    // Problem here is that author link expects a share search-result contributor,
    // not a store instance of a contributor and its user(s).
    this.set('contributor', contributor);

    this.render(hbs`{{author-link}}`);
    assert.equal(this.$().text().trim(), '');

});
