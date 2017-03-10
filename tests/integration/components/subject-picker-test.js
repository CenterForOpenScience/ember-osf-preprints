import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('subject-picker', 'Integration | Component | subject picker', {
  integration: true
});

test('it renders', function(assert) {

  //TODO: looks like author-link tests

  this.render(hbs`{{subject-picker}}`);

  assert.equal(this.$().text().trim(), '');

});
