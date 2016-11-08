import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('preprint-navbar-branded', 'Integration | Component | preprint navbar branded', {
  integration: true,
});

test('it renders', function(assert) {
    this.render(hbs`{{preprint-navbar-branded}}`);

    assert.notEqual(this.$().text().trim(), '');
});
