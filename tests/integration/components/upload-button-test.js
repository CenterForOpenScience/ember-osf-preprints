import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('upload-button', 'Integration | Component | upload button', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{upload-button}}`);

  assert.equal(this.$('h1').text().trim(), 'Contribute your research');
  assert.equal(this.$('h3').text().trim(), 'You can upload a preprint or choose a file from an ' +
      'existing OSF file to tag as a preprint if you are already have an OSF account.');
});
