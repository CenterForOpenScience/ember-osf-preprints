import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';

moduleForComponent('search-facet-taxonomy', 'Integration | Component | search facet taxonomy', {
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
    const artsAndHumanities = {
        showChildren: false,
        text: 'Arts and Humanities',
        children: []
    };

    const education = {
        showChildren: false,
        text: 'Education',
        children: []
    };
    this.set('topLevelItem', Ember.A([artsAndHumanities, education]));
    render(this, 'topLevelItem=topLevelItem');
    assert.equal(this.$('label')[0].innerText.trim(), 'Arts and Humanities');
    assert.equal(this.$('label')[1].innerText.trim(), 'Education');
});
