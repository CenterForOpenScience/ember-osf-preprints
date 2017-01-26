import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('page-controls', 'Integration | Component | page controls', {
  integration: true
});

test('it renders', function(assert) {

  this.render(hbs`{{page-controls}}`);

  assert.ok(this);
});
