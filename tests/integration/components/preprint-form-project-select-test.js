import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('preprint-form-project-select', 'Integration | Component | preprint form project select', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{preprint-form-project-select}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#preprint-form-project-select}}
      template block text
    {{/preprint-form-project-select}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
