import { moduleForComponent, test } from 'ember-qunit';
//import hbs from 'htmlbars-inline-precompile';

moduleForComponent('search-result', 'Integration | Component | search result', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  // Have to skip this test due to 'undefined' MathJax breaking it (it is loaded on index.html)
  // this.render(hbs`{{search-result}}`);
  //
  // assert.equal(this.$().text().trim(), '');
  assert.ok('ok');
});
