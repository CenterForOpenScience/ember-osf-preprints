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

test('allow handleToggle when allowOpen is true', function(assert) {
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
    this.set('errorAction', () => {}); // noop

    this.render(hbs`
        {{#preprint-form-section allowOpen=allowOpen errorAction=errorAction}}
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

test('addPreprintFormBlock correctly adds css class `preprint-form-block` if canEdit is true and innerForm is false', function(assert) {
    this.set('canEdit', true);
    this.set('innerForm', false);
    this.render(hbs`
        {{#preprint-form-section allowOpen=allowOpen errorAction=errorAction canEdit=canEdit innerForm=innerForm}}
            {{#preprint-form-header}}Title{{/preprint-form-header}}
            {{#preprint-form-body}}Body{{/preprint-form-body}}
        {{/preprint-form-section}}
    `);
    assert.ok(this.$('.preprint-form-block').length);

    this.set('canEdit', true);
    this.set('innerForm', true);
    this.render(hbs`
        {{#preprint-form-section allowOpen=allowOpen errorAction=errorAction canEdit=canEdit innerForm=innerForm}}
            {{#preprint-form-header}}Title{{/preprint-form-header}}
            {{#preprint-form-body}}Body{{/preprint-form-body}}
        {{/preprint-form-section}}
    `);
    assert.ok(!this.$('.preprint-form-block').length);

    this.set('canEdit', false);
    this.set('innerForm', true);
    this.render(hbs`
        {{#preprint-form-section allowOpen=allowOpen errorAction=errorAction canEdit=canEdit innerForm=innerForm}}
            {{#preprint-form-header}}Title{{/preprint-form-header}}
            {{#preprint-form-body}}Body{{/preprint-form-body}}
        {{/preprint-form-section}}
    `);
    assert.ok(!this.$('.preprint-form-block').length);

    this.set('canEdit', false);
    this.set('innerForm', false);
    this.render(hbs`
        {{#preprint-form-section allowOpen=allowOpen errorAction=errorAction canEdit=canEdit innerForm=innerForm}}
            {{#preprint-form-header}}Title{{/preprint-form-header}}
            {{#preprint-form-body}}Body{{/preprint-form-body}}
        {{/preprint-form-section}}
    `);
    assert.ok(!this.$('.preprint-form-block').length);
});

test('only renders when canEdit is true', function(assert) {
    this.set('canEdit', true);
    this.render(hbs`
        {{#preprint-form-section allowOpen=allowOpen errorAction=errorAction canEdit=canEdit}}
            <div id="this-is-a-unique-id">
                aloha
            </div>
        {{/preprint-form-section}}
    `);
    assert.ok(this.$('#this-is-a-unique-id').length);

    this.set('canEdit', false);
    this.render(hbs`
        {{#preprint-form-section allowOpen=allowOpen errorAction=errorAction canEdit=canEdit}}
            <div id="this-is-a-unique-id">
                aloha
            </div>
        {{/preprint-form-section}}
    `);
    assert.ok(!this.$('#this-is-a-unique-id').length);
});
