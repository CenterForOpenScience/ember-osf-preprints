import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('preprint-title-editor', 'Integration | Component | preprint title editor', {
    integration: true,
    beforeEach: function() {
        this.set('titleValid', null);
    }
});

//having issues actually getting titleValid to keep track of state
const componentRoot = `preprint-title-editor
    titlePlaceholder='placeholder'
    titleValid=titleValid`;

function component() {
    return Ember.HTMLBars.compile(
        `{{preprint-title-editor
            titlePlaceholder='placeholder'
            titleValid=titleValid
            ${[...arguments].join(' ')}
        }}`
    )
}

test('renders valid title', function(assert) {
    let component = Ember.HTMLBars.compile(`{{${componentRoot} nodeTitle='This is a valid title'}}`);
    this.render(component);

    assert.ok(this.get('titleValid'));
    assert.ok(this.$('.valid-input').length);
});

test('renders no title', function(assert) {
    let component = Ember.HTMLBars.compile(`{{${componentRoot}}}`);
    this.render(component);
    assert.ok(!this.get('titleValid'));
    assert.ok(this.$('.warning').length);
});

test('renders invalid title', function(assert) {
    let component = Ember.HTMLBars.compile(`{{${componentRoot} nodeTitle=${'Title is too long'.repeat(250)}}}`);
    this.render(component);
    assert.ok(!this.get('titleValid'));
    assert.ok(this.$('.error').length);
});
