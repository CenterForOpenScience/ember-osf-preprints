import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('taxonomy-tree', 'Integration | Component | taxonomy tree', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.set('tree', {
      get() {}
  });

  this.render(hbs`{{taxonomy-tree tree=tree}}`);

  assert.ok(this.$('#taxonomyTree').length);
});
