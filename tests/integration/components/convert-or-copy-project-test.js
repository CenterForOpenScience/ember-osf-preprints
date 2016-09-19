import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('convert-or-copy-project', 'Integration | Component | convert or copy project', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{convert-or-copy-project}}`);

  assert.equal(this.$('#convertExistingOrCreateComponent label').text().trim(), 'Make a new component  Use the current component');

  // Template block usage:
  this.render(hbs`
    {{#convert-or-copy-project}}
      template block text
    {{/convert-or-copy-project}}
  `);
});
