import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('preprint-footer-branded', 'Integration | Component | preprint footer branded', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{preprint-footer-branded}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#preprint-footer-branded}}
      template block text
    {{/preprint-footer-branded}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
