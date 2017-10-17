import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('pretty-column-display', 'Integration | Component | pretty column display', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{pretty-column-display}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#pretty-column-display}}
      template block text
    {{/pretty-column-display}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
