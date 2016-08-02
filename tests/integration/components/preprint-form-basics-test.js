import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('preprint-form-basics', 'Integration | Component | preprint form basics', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.on('verify', function() {});

  this.render(hbs`{{preprint-form-basics verify=(action 'verify')}}`);

  assert.ok(this.$('span.required').length);
});
