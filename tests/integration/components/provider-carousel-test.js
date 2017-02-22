import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('provider-carousel', 'Integration | Component | provider carousel', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.set('providers', new Array(8));
  this.render(hbs`{{provider-carousel
      providers=providers
  }}`);

  assert.equal(this.$().context.innerText, 'PreviousNext');
});
