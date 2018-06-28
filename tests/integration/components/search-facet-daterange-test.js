import Service from '@ember/service';

import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import tHelper from 'ember-i18n/helper';

// Stub i18n service
const i18nStub = Service.extend({
    t(word) {
        const translated = {
            'eosf.components.searchFacetDaterange.allTime': 'All time',
        };
        return translated[word];
    },
});

moduleForComponent('search-facet-daterange', 'Integration | Component | search facet daterange', {
    integration: true,
    beforeEach() {
        this.registry.register('helper:t', tHelper);
        this.register('service:i18n', i18nStub);
        this.inject.service('i18n', { as: 'i18n' });
    },
});

test('it renders', function(assert) {
    this.set('key', 'date');
    this.set('options', { key: 'date', title: 'Date', component: 'search-facet-daterange' });
    this.set('state', '');
    this.set('filter', '');
    this.set('onChange', () => {});

    this.render(hbs`{{search-facet-daterange
        key=key
        options=options
        state=state
        filter=filter
        onChange=(action onChange)
    }}`);

    assert.equal(this.$().text().trim(), 'All time');
});
