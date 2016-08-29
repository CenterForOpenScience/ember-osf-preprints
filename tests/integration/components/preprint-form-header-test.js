import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('preprint-form-header', 'Integration | Component | preprint form header', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  const name = 'test';
  this.set('name', name);

  this.render(hbs`{{preprint-form-header name=name}}`);

  assert.equal(this.$().text().trim(), name);
});
