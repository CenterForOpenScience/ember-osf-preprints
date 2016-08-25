import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('preprint-navbar', 'Integration | Component | preprint navbar', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{preprint-navbar}}`);

  assert.equal(this.$().find('.navbar-brand').text().trim(), 'OSF Preprints');
});
