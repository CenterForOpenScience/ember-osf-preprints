import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('preprint-form-upload', 'Integration | Component | preprint form upload', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.on('verify', function() {});

  this.render(hbs`{{preprint-form-upload verify=(action 'verify')}}`);

  assert.equal(this.$('button').text().trim(), 'Upload a New FileSelect a file from OSF');
});
