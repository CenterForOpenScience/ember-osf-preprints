import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('preprint-form-subjects', 'Integration | Component | preprint form subjects', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.on('verify', function() {});

  this.render(hbs`{{preprint-form-subjects verify=(action 'verify')}}`);

  assert.equal(this.$('ul').length, 3);
});
