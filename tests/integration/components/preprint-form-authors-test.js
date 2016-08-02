import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('preprint-form-authors', 'Integration | Component | preprint form authors', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.on('verify', function() {});

  this.render(hbs`{{preprint-form-authors verify=(action 'verify')}}`);

  assert.ok(this.$('.form').length);
});
