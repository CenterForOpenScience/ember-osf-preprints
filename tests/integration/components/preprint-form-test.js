import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('preprint-form', 'Integration | Component | preprint form', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{preprint-form}}`);

  assert.ok(this.$('#preprint-form-upload').length);
  assert.ok(this.$('#preprint-form-basics').length);
  assert.ok(this.$('#preprint-form-subjects').length);
  assert.ok(this.$('#preprint-form-authors').length);
  assert.ok(this.$('#preprint-form-submit').length);
});
