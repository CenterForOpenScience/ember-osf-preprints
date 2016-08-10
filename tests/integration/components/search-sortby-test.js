import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('search-sortby', 'Integration | Component | search sortby', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.set('options', ['Relevance']);

  this.render(hbs`{{search-sortby options=options}}`);

  let toTest = this.$().text().trim();

  assert.equal(toTest.substring(0, toTest.indexOf('\n')), 'Sort by: Relevance');

  // No need to test for template block usage
});
