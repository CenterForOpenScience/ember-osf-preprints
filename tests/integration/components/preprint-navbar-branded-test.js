import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('preprint-navbar-branded', 'Integration | Component | preprint navbar branded', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
    this.render(hbs`{{preprint-navbar-branded}}`);

    assert.ok(this);
});
