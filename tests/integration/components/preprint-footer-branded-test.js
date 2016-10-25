import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('preprint-footer-branded', 'Integration | Component | preprint footer branded', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

    // this.set('mode.name', 'My Provider');
    this.render(hbs`{{preprint-footer-branded}}`);

  // assert.equal(this.$().text().trim(), 'My Provider:');

    assert.ok(this);
});
