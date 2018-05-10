import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('preprint-form-section', 'Integration | Component | preprint form section', {
    integration: true,
});

test('it renders', function(assert) {
    this.render(hbs`{{preprint-form-section}}`);

    assert.equal(this.$().text().trim(), '');
    // Template block usage:
    this.render(hbs`
        {{#preprint-form-section allowOpen=allowOpen}}
            Preprint Stuff goes in Here
        {{/preprint-form-section}}
    `);

    assert.equal(this.$().text().trim(), 'Preprint Stuff goes in Here');
});

test('allow handleToggle when allowOpen is true alskjflaskdjf', function(assert) {
    this.set('allowOpen', true);
    this.render(hbs`
        {{#preprint-form-section allowOpen=allowOpen}}
            {{#preprint-form-header allowOpen=allowOpen }}Title{{/preprint-form-header}}
            {{#preprint-form-body}}Body{{/preprint-form-body}}
        {{/preprint-form-section}}
    `);
    assert.ok(this.$('.cp-is-closed').length);
    assert.ok(!this.$('.cp-is-open').length);

    this.$('header').click();

    assert.ok(!this.$('.cp-is-closed').length);
    assert.ok(this.$('.cp-is-open').length);
});

test('does not allow handleToggle when allowOpen is false', function(assert) {
    this.set('allowOpen', false);
    this.render(hbs`
        {{#preprint-form-section allowOpen=allowOpen}}
            {{#preprint-form-header}}Title{{/preprint-form-header}}
            {{#preprint-form-body}}Body{{/preprint-form-body}}
        {{/preprint-form-section}}
    `);
    assert.ok(this.$('.cp-is-closed').length);
    assert.ok(!this.$('.cp-is-open').length);

    this.$('header').click();

    assert.ok(this.$('.cp-is-closed').length);
    assert.ok(!this.$('.cp-is-open').length);
});
