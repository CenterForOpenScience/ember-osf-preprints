import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('multiple-textbox-input', 'Integration | Component | multiple textbox input', {
    integration: true,
    beforeEach() {
        this.set('model', []);
        this.set('modelWithExistingValues', ['ichi', 'ni', 'san', 'yon']);
        this.set('valuePath', 'value');
    },
});

test('it renders', function(assert) {
    this.render(hbs`{{multiple-textbox-input model=model}}`);
    assert.equal($('.ember-text-field').length, 1, 'one text field by default');
    assert.equal($('.btn-danger').length, 0, 'no remove button for single text field');
    assert.equal($('.btn-success').length, 1, 'one add button');
});

test('it loads passed in fields', function(assert) {
    this.render(hbs`{{multiple-textbox-input model=modelWithExistingValues}}`);
    assert.equal($('.ember-text-field').length, 4, 'has four text fields when passed in an array of four');
    assert.equal($('.btn-danger').length, 3, 'has three remove buttons when passed in array of four');
    assert.equal($('.btn-success').length, 1, 'one add button');
});

test('Can add and remove fields', function(assert) {
    this.render(hbs`{{multiple-textbox-input model=modelWithExistingValues}}`);
    this.$('.btn-danger')[0].click();
    assert.equal($('.ember-text-field').length, 3, 'has three text fields after single remove');
    assert.equal($('.btn-danger').length, 2, 'has two remove buttons after single remove');
    assert.equal($('.ember-text-field')[0].value, 'ni', 'old index 1 now index 0 after single remove');
    assert.equal($('.ember-text-field')[2].value, 'yon', 'old index 3 now index 2 after single remove');
    this.$('.btn-success')[0].click();
    assert.equal($('.ember-text-field').length, 4, 'has 4 text fields after single add');
    assert.equal($('.btn-danger').length, 3, 'has three remove buttons after single remove');
    assert.equal($('.ember-text-field')[0].value, 'ni', 'existing index 0 unchanged by add');
    assert.equal($('.ember-text-field')[2].value, 'yon', 'existing index 2 unchanged by add');
    assert.equal($('.ember-text-field')[3].value, '', 'new text field is empty');
    assert.equal($('.btn-success').length, 1);
});
