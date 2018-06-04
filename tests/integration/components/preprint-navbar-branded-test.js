import { moduleForComponent, skip } from 'ember-qunit';
import Service from '@ember/service';
import hbs from 'htmlbars-inline-precompile';

import tHelper from 'ember-i18n/helper';

// Stub i18n service
const i18nStub = Service.extend({
    t(key) {
        const translated = {
            'global.search': 'Search',
            'components.preprint-navbar-branded.donate': 'Donate',
            'eosf.authDropdown.signIn': 'Sign In',
            'eosf.authDropdown.signUp': 'Sign Up',
        };
        return translated[key];
    },
});

moduleForComponent('preprint-navbar-branded', 'Integration | Component | preprint navbar branded', {
    integration: true,
    beforeEach() {
        this.registry.register('helper:t', tHelper);
        this.register('service:i18n', i18nStub);
    },
});

skip('renders preprint navbar branded', function(assert) {
    this.render(hbs`{{preprint-navbar-branded}}`);
    assert.equal(this.$().text().replace(/\s+/g, ' ').trim(), 'Search Donate Sign Up Sign In');
});
