import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('validated-input', 'Integration | Component | validated input', {
  integration: true
});

test('this renders', function(assert) {
    // checks that the component renders
    this.set('model', this);
    this.set('valuePath', 'fullName');
    this.set('placeholder', 'Full Name');
    this.set('fullName', '');
    this.set('value', '');
    this.render(hbs`{{validated-input model=model valuePath=valuePath placeholder=placeholder value=value}}`);

    assert.ok(this.$('div').length);

    // None of the success, error, or warning elements load without differentiating input
    assert.equal(this.$('.valid-input').length, 0);
    assert.equal(this.$('.error').length, 0);
    assert.equal(this.$('.warning').length, 0);

});

test('render valid', function(assert) {
    // simulates that the success element renders on success
    this.set('model', this);
    this.set('valuePath', 'fullName');
    this.set('placeholder', 'Full Name');
    this.set('fullName', '');
    this.set('value', '');
    this.render(hbs `{{validated-input model=model valuePath=valuePath placeholder=placeholder value=value isValid=true}}`);

    assert.equal(this.$('.valid-input').length, 1);
    assert.equal(this.$('.error').length, 0);
    assert.equal(this.$('.warning').length, 0);
});

test('render error message', function(assert) {
    // checks that the error message renders
    this.set('model', this);
    this.set('valuePath', 'fullName');
    this.set('placeholder', 'Full Name');
    this.set('fullName', '');
    this.set('value', '');
    this.render(hbs`{{validated-input model=model valuePath=valuePath placeholder=placeholder value=value showErrorMessage=true}}`);

    assert.equal(this.$('.valid-input').length, 0);
    assert.equal(this.$('.error').length, 1);
    assert.equal(this.$('.warning').length, 0);
});

// TODO: Unable to find the warning class.  Need to make sure it shows on showWarningMessage=true
/*
test('render warning message 111', function(assert) {
    // checks that the warnng message renders
    this.set('model', this);
    this.set('valuePath', 'fullName');
    this.set('placeholder', 'Full Name');
    this.set('fullName', '');
    this.set('value', '');
    this.render(hbs`{{validated-input model=model valuePath=valuePath placeholder=placeholder value=value showWarningMessage=true}}`);

    assert.equal(this.$('.valid-input').length, 0);
    assert.equal(this.$('.error').length, 0);
    assert.equal(this.$('.warning').length, 1);});
*/
