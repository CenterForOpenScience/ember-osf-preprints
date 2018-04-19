import { moduleForComponent, test } from 'ember-qunit';
import { resolve } from 'rsvp';
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import ArrayProxy from '@ember/array/proxy';
import Service from '@ember/service';
import hbs from 'htmlbars-inline-precompile';

const taxonomiesQuery = () => resolve(ArrayProxy.create({
    content: A([
        EmberObject.create({
            text: 'Arts and Humanities',
            parents: [],
            child_count: 50,
        }),
        EmberObject.create({
            text: 'Education',
            parents: [],
            child_count: 27,
        }),
        EmberObject.create({
            text: 'Filmography',
            parents: [],
            child_count: 13,
        }),
        EmberObject.create({
            text: 'Gastronomy',
            parents: [],
            child_count: 67,
        }),
    ]),
}));

// Stub location service
const themeStub = Service.extend({
    isProvider: true,
    provider: resolve({
        name: 'OSF',
        queryHasMany: taxonomiesQuery,
    }),
});

moduleForComponent('search-facet-taxonomy', 'Integration | Component | search facet taxonomy', {
    integration: true,
    beforeEach() {
        this.register('service:theme', themeStub);
        this.inject.service('theme');
        this.set('facet', { key: 'subjects', title: 'Subject', component: 'search-facet-taxonomy' });
        this.set('key', 'subjects');
        const noop = () => {};
        this.set('noop', noop);
        this.set('activeFilters', { providers: [], subjects: [] });
        this.set('filterReplace', { 'Open Science Framework': 'OSF' });
    },
});

test('One-level hierarchy taxonomies', function(assert) {
    this.render(hbs`{{search-facet-taxonomy
        key=key
        options=facet
        updateFilters=(action noop)
        activeFilters=activeFilters
        filterReplace=filterReplace
    }}`);
    assert.equal(this.$('label')[0].innerText.trim(), 'Arts and Humanities');
    assert.equal(this.$('label')[1].innerText.trim(), 'Education');
    assert.equal(this.$('label')[2].innerText.trim(), 'Filmography');
    assert.equal(this.$('label')[3].innerText.trim(), 'Gastronomy');
});
