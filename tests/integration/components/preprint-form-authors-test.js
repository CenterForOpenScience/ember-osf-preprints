import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('preprint-form-authors', 'Integration | Component | preprint form authors', {
  integration: true
});

test('it renders', function(assert) {
  this.on('verify', function() {});

  this.render(hbs`{{preprint-form-authors verify=(action 'verify')}}`);

  assert.ok(this.$('.form').length);
});
