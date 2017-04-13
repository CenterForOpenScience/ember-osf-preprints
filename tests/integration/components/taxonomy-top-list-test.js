import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

moduleForComponent('taxonomy-top-list', 'Integration | Component | taxonomy top list', {
    integration: true
});

test('it renders', function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    this.set('list', Ember.A([{id: 1, text: 'Biology', children: [{text: 'Public Health'}]}, {id: 2, text: 'Engineering', children:[{text: 'Computer Science'}]}]));
    //Ember.$('#' + subjectId).attr('data-hint', result); Ember.$('#' + subjectId).attr('aria-label', result);
    this.render(hbs`{{taxonomy-top-list list=list}}`);

    assert.equal(this.$().text().replace(/\s/g, ''), 'BiologyEngineering');

    assert.equal(this.$('#1').attr('data-hint'), 'Public Health');
    assert.equal(this.$('#1').attr('aria-label'), 'Public Health');

    assert.equal(this.$('#2').attr('data-hint'), 'Computer Science');
    assert.equal(this.$('#2').attr('aria-label'), 'Computer Science');
});
