import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('pretty-column-display', 'Integration | Component | pretty column display', {
  integration: true
});

test('it renders', function(assert) {
  this.set('items', ['1', '2'])
  this.render(hbs`
    {{#pretty-column-display items=items as |item|}}
      {{item}}
    {{/pretty-column-display}}
  `);

  assert.ok(this.$().text().trim());
});
