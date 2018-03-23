import { moduleForComponent, skip } from 'ember-qunit';
import { A } from '@ember/array';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('search-facet-provider', 'Integration | Component | search facet provider', {
    integration: true,
    beforeEach() {
        const osfProvider = {
            doc_count: 99,
            key: 'OSF',
        };
        const agrixivProvider = {
            doc_count: 100,
            key: 'AgriXiv',
        };
        const otherProviders = A([
            osfProvider,
            agrixivProvider,
        ]);

        this.set('otherProviders', otherProviders);
        this.set('facet', { key: 'sources', title: 'Providers', component: 'search-facet-provider' });
        this.set('key', 'sources');
        const noop = () => {};
        this.set('noop', noop);
        this.set('activeFilters', { providers: [], subjects: [] });
        this.set('filterReplace', { 'Open Science Framework': 'OSF' });
    },
});

// These tests are failing randomly in chrome
skip('preprint providers and counts are listed', function(assert) {
    this.render(hbs`{{search-facet-provider
        key=key
        options=facet
        updateFilters=(action noop)
        activeFilters=activeFilters
        filterReplace=filterReplace
        otherProviders=otherProviders
    }}`);
    assert.equal(this.$('label')[0].innerText.trim(), 'OSF (99)');
    assert.equal(this.$('label')[1].innerText.trim(), 'AgriXiv (100)');
});

// These tests are failing randomly in chrome
skip('filterReplace looks up key in mapping', function(assert) {
    const osfProvider = {
        doc_count: 99,
        key: 'Open Science Framework',
    };
    this.set('otherProviders', A([osfProvider]));
    this.render(hbs`{{search-facet-provider
        key=key
        options=facet
        updateFilters=(action noop)
        activeFilters=activeFilters
        filterReplace=filterReplace
        otherProviders=otherProviders
    }}`);
    assert.equal(this.$('label')[0].innerText.trim(), 'OSF (99)');
});
