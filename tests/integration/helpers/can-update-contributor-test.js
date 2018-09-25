import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('can-update-contributor', 'helper:can-update-contributor', {
    integration: true,
});

// Replace this with your real tests.
test('it renders', function(assert) {
    this.set('inputValue', '1234');

    this.render(hbs`{{can-update-contributor inputValue}}`);

    assert.equal(this.$().text().trim(), '1234');
});
