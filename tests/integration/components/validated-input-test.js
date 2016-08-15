import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('validated-input', 'Integration | Component | validated input', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.set('model', this);
  this.set('valuePath', 'fullName');
  this.set('placeholder', 'Full Name');
  this.render(hbs`{{validated-input placeholder=placeholder}}`);

  assert.ok(this.$('div').length);
});
