import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('preprint-form-header', 'Integration | Component | preprint form header', {
    integration: true
});

test('it renders', function(assert) {
    this.render(hbs`{{preprint-form-header name='Upload'}}`);
    assert.equal(this.$('.section-header').text().trim(), 'Upload');
});

test('clicking on header triggers isOpen', function(assert){
    this.render(hbs`
        {{#preprint-form-section allowOpen=true as |section|}}
            {{#section.header name='Upload'}}Title{{/section.header}}
            {{#section.body}}Body{{/section.body}}
        {{/preprint-form-section}}
    `);
    assert.ok(this.$('.preprint-header-preview').length);
    this.$('header').click();
    assert.ok(!this.$('.preprint-header-preview').length);
});
