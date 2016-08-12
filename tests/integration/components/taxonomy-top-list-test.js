import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

moduleForComponent('taxonomy-top-list', 'Integration | Component | taxonomy top list', {
    integration: true
});

test('it renders', function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    this.set('list', Ember.A([{text: 'b'}, {text: 'a'}]));

    this.render(hbs`{{taxonomy-top-list list=list}}`);

    // Should be sorted as 'ab', not 'ba'
    assert.equal(this.$().text().replace(/\s/g, ''), 'ab');
});
