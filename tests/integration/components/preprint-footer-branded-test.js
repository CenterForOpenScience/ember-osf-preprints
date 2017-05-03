import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('preprint-footer-branded', 'Integration | Component | preprint footer branded', {
  integration: true
});

test('shows Twitter', function(assert) {
    this.set('model', {
        socialTwitter: 'vincestaples'
    });

    this.render(hbs`{{preprint-footer-branded model=model}}`);

    assert.equal(this.$('.fa-twitter').length, 1);
    assert.equal(this.$('.fa-facebook').length, 0);
    assert.equal(this.$('.fa-instagram').length, 0);
});

test('shows Facebook', function(assert) {
    this.set('model', {
        socialFacebook: 'theWeatherStn'
    });

    this.render(hbs`{{preprint-footer-branded model=model}}`);

    assert.equal(this.$('.fa-twitter').length, 0);
    assert.equal(this.$('.fa-facebook').length, 1);
    assert.equal(this.$('.fa-instagram').length, 0);
});

test('shows Instagram', function(assert) {
    this.set('model', {
        socialInstagram: 'welpherewego'
    });

    this.render(hbs`{{preprint-footer-branded model=model}}`);

    assert.equal(this.$('.fa-twitter').length, 0);
    assert.equal(this.$('.fa-facebook').length, 0);
    assert.equal(this.$('.fa-instagram').length, 1);
});

test('shows all social', function(assert) {
    this.set('model', {
        socialTwitter: 'vincestaples',
        socialFacebook: 'theWeatherStn',
        socialInstagram: 'welpherewego'
    });

    this.render(hbs`{{preprint-footer-branded model=model}}`);

    assert.equal(this.$('.fa-twitter').length, 1);
    assert.equal(this.$('.fa-facebook').length, 1);
    assert.equal(this.$('.fa-instagram').length, 1);
});

test('uses provider name', function(assert) {
    const name = 'Social Experiment';
    this.set('model', { name });

    this.render(hbs`{{preprint-footer-branded model=model}}`);

    assert.ok(this.$(`.branded-footer-links:contains('${name}')`).length);
});
