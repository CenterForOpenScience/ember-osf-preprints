import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('search-header', 'Integration | Component | search header', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.set('title', 'Preprints');

  this.render(hbs`{{search-header title='Preprints' subtitle=''}}`);

  assert.equal(this.$().text().trim(), 'Preprints');
});
