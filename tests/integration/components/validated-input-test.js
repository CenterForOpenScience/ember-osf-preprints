import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('validated-input', 'Integration | Component | validated input', {
    integration: true
});

test('this renders', function(assert) {
    // checks that the component renders
    this.render(hbs`{{validated-input}}`);
    assert.ok(this.$('div').length);

    assert.equal(this.$('.valid-input').length, 0);
    assert.equal(this.$('.error').length, 0);
    assert.equal(this.$('.warning').length, 0);

});

test('render valid', function(assert) {
    // simulates that the success element renders on success
    this.render(hbs`{{validated-input isValid=true}}`);

    assert.equal(this.$('.valid-input').length, 1);
    assert.equal(this.$('.error').length, 0);
    assert.equal(this.$('.warning').length, 0);
});

test('render error message', function(assert) {
    // checks that the error message renders
    this.render(hbs`{{validated-input showErrorMessage=true}}`);

    assert.equal(this.$('.valid-input').length, 0);
    assert.equal(this.$('.error').length, 1);
    assert.equal(this.$('.warning').length, 0);
});

// TODO: Test currently cannot find '.warning'
/*
test('render warning message', function(assert) {
    // checks that the warnng message renders
    render(this, 'showWarningMessage=true');

    assert.equal(this.$('.valid-input').length, 0);
    assert.equal(this.$('.error').length, 0);
    assert.equal(this.$('.warning').length, 1);

});
*/
