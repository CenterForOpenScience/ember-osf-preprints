import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('supplementary-file-browser', 'Integration | Component | supplementary file browser', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{supplementary-file-browser}}`);

  assert.equal(this.$().text().trim(), '');

  this.on('changeFile', function() {});

});
