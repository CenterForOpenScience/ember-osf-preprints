import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';

moduleForComponent('search-facet-taxonomu', 'Integration | Component | search facet taxonomy', {
    integration: true,
    beforeEach: function() {
        this.set('facet', {key: 'subjects', title: 'Subject', component: 'search-facet-taxonomy'});
        this.set('key', 'subjects');
        let noop = () => {};
        this.set('noop', noop);
        this.set('activeFilters', {providers: [], subjects: []});
        this.set('filterReplace', {'Open Science Framework': 'OSF'});
    }
});

function render(context, componentArgs) {
    return context.render(Ember.HTMLBars.compile(`{{search-facet-taxonomy
        key=key
        options=facet
        updateFilters=(action noop)
        activeFilters=activeFilters
        filterReplace=filterReplace
        ${componentArgs || ''}
    }}`));
}

test('One-level hierarchy taxonomies', function(assert) {
    const Engineering = {
        showChildren: true,
        text: 'Engineering',
        children: []
    };
    const Law = {
        showChildren: true,
        text: 'Law',
        children: []
    };
    this.set('topLevelItem', Ember.A([Engineering, Law]));
    render(this, 'topLevelItem=topLevelItem');
    assert.equal(this.$('label')[0].outerText.trim(), 'Engineering');
    assert.equal(this.$('label')[1].outerText.trim(), 'Law');
});

test('Two-level hierarchy taxonomies', function(assert) {
    const Engineering = {
        showChildren: true,
        text: 'Engineering',
        children: [
            {
                showChildren: true,
                text: 'Aerospace Engineering'
            }
        ]
    };
    const Law = {
        showChildren: true,
        text: 'Law',
        children: [
            {
                showChildren: true,
                text: 'Agriculture Law'
            }
        ]
    };
    this.set('topLevelItem', Ember.A([Engineering, Law]));
    render(this, 'topLevelItem=topLevelItem');
    assert.equal(this.$('label')[0].outerText.trim(), 'Engineering');
    assert.equal(this.$('label')[1].outerText.trim(), 'Aerospace Engineering');
    assert.equal(this.$('label')[2].outerText.trim(), 'Law');
    assert.equal(this.$('label')[3].outerText.trim(), 'Agriculture Law');
});
