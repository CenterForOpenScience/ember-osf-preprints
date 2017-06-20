import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('preprint-title-editor', 'Integration | Component | preprint title editor', {
    integration: true
});

function render(context, componentArgs) {
    return context.render(Ember.HTMLBars.compile(`{{preprint-title-editor
        ${componentArgs || ''}
    }}`));
}
//TODO: tests based on error messages, as isValid is not triggering properly
//cursory glance at ember-cpi-validations seem to indicate trouble with testing

test('renders valid title', function(assert) {
    render(this, 'nodeTitle="This is a valid title"');
    assert.ok(!this.$('.error').length);
});

test('renders no title', function(assert) {
    this.set('title', 'Valid Title');
    render(this, 'nodeTitle=title');
    //Need to go from actual input to no input to trigger validation
    this.set('title', '');
    assert.ok(this.$('.error').length);
});

test('renders invalid title', function(assert) {
    render(this, `nodeTitle='${'Title is too long'.repeat(250)}'`);
    assert.ok(this.$('.error').length);
});
