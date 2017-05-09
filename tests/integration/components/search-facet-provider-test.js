import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';

moduleForComponent('search-facet-provider', 'Integration | Component | search facet provider', {
    integration: true,
    beforeEach: function() {
        let osfProvider = {
            doc_count: 99,
            key: 'OSF'
        };
        let agrixivProvider = {
            doc_count: 100,
            key: 'AgriXiv'
        };
        let otherProviders =  Ember.A([
            osfProvider,
            agrixivProvider
        ]);

        this.set('otherProviders', otherProviders);
        this.set('facet', { key: 'sources', title: 'Providers', component: 'search-facet-provider' });
        this.set('key', 'sources');
        let noop = () => {};
        this.set('noop', noop);
        this.set('activeFilters', { providers: [], subjects: [] });
        this.set('filterReplace',  {'Open Science Framework': 'OSF'});
    }
});

function render(context, componentArgs) {
    return context.render(Ember.HTMLBars.compile(`{{search-facet-provider
        key=key
        options=facet
        updateFilters=(action noop)
        activeFilters=activeFilters
        filterReplace=filterReplace
        otherProviders=otherProviders
        ${componentArgs || ''}
    }}`));
}


test('preprint providers and counts are listed', function(assert) {
    render(this);
    assert.equal(this.$('label')[0].innerText.trim(), 'OSF (99)');
    assert.equal(this.$('label')[1].innerText.trim(), 'AgriXiv (100)');
});

test('filterReplace looks up key in mapping', function(assert) {
   let osfProvider = {
        doc_count: 99,
        key: 'Open Science Framework'
    };
    this.set('otherProviders', Ember.A([osfProvider]));
    render(this, 'otherProviders=otherProviders');
    assert.equal(this.$('label')[0].innerText.trim(), 'OSF (99)');
});
