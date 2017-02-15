import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('provider-carousel', 'Integration | Component | provider carousel', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{provider-carousel}}`);

  assert.equal(this.$().context.innerText, 'PreviousNext');
});
