import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';


moduleForComponent('preprint-navbar-branded', 'Integration | Component | preprint navbar branded', {
    integration: true,
});

test('renders preprint navbar branded', function(assert) {
    this.set('provider', {
        name: 'OSF',
    });
    this.render(hbs`{{preprint-navbar-branded model=provider}}`);
    assert.equal(this.$().text().replace(/\s+/g, ' ').trim(), 'OSF Search Donate Sign Up Sign In');
});
