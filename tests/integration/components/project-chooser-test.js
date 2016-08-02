import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('project-chooser', 'Integration | Component | project chooser', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{project-chooser}}`);

  assert.equal(this.$('#newFileButton').text().trim(), 'Upload a file and create an OSF project');
  assert.equal(this.$('#existingProjectButton').text().trim(), 'Upload a file to an existing OSF project');
  assert.equal(this.$('#existingFileButton').text().trim(), 'Choose a file from an existing OSF project');
});
