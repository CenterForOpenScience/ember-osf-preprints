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

    // checks if the tooltip and link render
    assert.ok(this.$('.subject-item').length);
    assert.ok(this.$('.subject-item a').length);

});

test('link if provider', function(assert) {
    // Tests the link in the case of being on a provider page
    this.set('list', Ember.A([{text: 'b'}]));
    this.set('theme', {
        isProvider: 'agrixiv'
    });

    this.render(hbs `{{taxonomy-top-list list=list theme=theme }}`);

    // checks that the link renders
    assert.ok(this.$('.subject-item a:contains(b)').length);

    // TODO: check link href
});
