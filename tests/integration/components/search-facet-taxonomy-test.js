import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const taxonomiesQuery = () => Ember.RSVP.resolve(Ember.ArrayProxy.create({
    content: Ember.A([
        Ember.Object.create({
            text: 'Arts and Humanities',
            parents: [],
            child_count: 50,
        }),
        Ember.Object.create({
            text: 'Education',
            parents: [],
            child_count: 27,
        })
    ]),
}));


//Stub location service
const themeStub = Ember.Service.extend({
    isProvider: true,
    provider: Ember.RSVP.resolve({
        name: 'OSF',
        query: taxonomiesQuery,

    })
});

moduleForComponent('search-facet-taxonomy', 'Integration | Component | search facet taxonomy', {
    integration: true,
    beforeEach: function() {
        this.register('service:theme', themeStub);
        this.inject.service('theme');
        this.set('facet', {key: 'subjects', title: 'Subject', component: 'search-facet-taxonomy'});
        this.set('key', 'subjects');
        let noop = () => {};
        this.set('noop', noop);
        this.set('activeFilters', {providers: [], subjects: []});
        this.set('filterReplace', {'Open Science Framework': 'OSF'});
    }
});

test('One-level hierarchy taxonomies', function(assert) {
    this.render(hbs`{{search-facet-taxonomy
        key=key
        options=facet
        updateFilters=(action noop)
        activeFilters=activeFilters
        filterReplace=filterReplace
    }}`);
    assert.equal(this.$('label')[0].outerText.trim(), 'Arts and Humanities');
    assert.equal(this.$('label')[1].outerText.trim(), 'Education');
});
