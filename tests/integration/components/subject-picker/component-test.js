import { moduleForComponent, skip } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('subject-picker', 'Integration | Component | subject picker', {
    integration: true,
});

// TODO wait for ability to populate from ember data store
skip('it renders', function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.set('subjects', []);
    this.set('subjectList', []);

    this.render(hbs`{{subject-picker editMode=false initialSubjects=subjects currentSubjects=subjectList}}`);

    assert.equal(this.$('.row:nth-of-type(1) > span').text().trim(), '');
});
