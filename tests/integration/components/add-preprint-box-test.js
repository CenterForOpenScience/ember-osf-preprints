import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('add-preprint-box', 'Integration | Component | add preprint box', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{add-preprint-box}}`);

  assert.ok(this.$().text().trim().includes, 'Do you want to add your own research as a preprint?');
});
