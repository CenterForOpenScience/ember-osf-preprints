import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('project-chooser', 'Integration | Component | project chooser', {
    integration: true,
});

test('it renders', function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(hbs`{{project-chooser}}`);

    assert.equal(this.$('#newFileButton').text().trim(), 'Upload a file and create an OSF project');
    assert.equal(this.$('#existingProjectButton').text().trim(), 'Upload a file to an existing OSF project');
    assert.equal(this.$('#existingFileButton').text().trim(), 'Choose a file from an existing OSF project');
});

test('new file', function(assert) {
    // Tests that the right component loads if the user uploads a new file

    this.render(hbs`{{project-chooser newFile=true}}`);

    assert.equal(this.$('#newPrereg').length, 1);
    assert.equal(this.$('#existingPrereg').length, 0);
    assert.equal(this.$('#existingProject').length, 0);
});

test('existing project', function(assert) {
    // Checks for existing project section to render

    this.render(hbs`{{project-chooser existingProject=true}}`);

    assert.equal(this.$('#newPrereg').length, 0);
    assert.equal(this.$('#existingPrereg').length, 1);
    assert.equal(this.$('#existingProject').length, 0);
});

test('existing file', function(assert) {
    // Checks for existing file section to render

    this.render(hbs`{{project-chooser existingFile=true}}`);

    assert.equal(this.$('#newPrereg').length, 0);
    assert.equal(this.$('#existingPrereg').length, 0);
    assert.equal(this.$('#existingProject').length, 1);
});
