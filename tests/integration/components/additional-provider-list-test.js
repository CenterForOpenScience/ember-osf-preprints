import { A } from '@ember/array';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('additional-provider-list', 'Integration | Component | additional provider list', {
    integration: true,
});

test('additionalProviderList renders', function(assert) {
    this.set('additionalProviders', A(['B Provider', 'A Provider']));
    this.render(hbs`{{additional-provider-list additionalProviders=additionalProviders}}`);

    // Should be alphabetically sorted as 'A Provider, B Provider'
    assert.equal(this.$().text().replace(/\s/g, ''), 'AProviderBProvider');

    assert.ok(this.$('.subject-item').length);
    assert.ok(this.$('.subject-item a').length);
});
