import { moduleForComponent, test } from 'ember-qunit';
import { resolve } from 'rsvp';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';


// Stub location service
const themeStub = Service.extend({
    isProvider: true,
    provider: resolve({
        name: 'OSF',
        additionalProviders: ['Other Provider'],

    }),
});

moduleForComponent('search-preprints', 'Integration | Component | search preprints', {
    integration: true,
    beforeEach() {
        this.register('service:theme', themeStub);
        this.inject.service('theme');
    },
});

test('it renders', function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    assert.expect(2);

    this.render(hbs`{{search-preprints search="search"}}`);

    assert.equal(this.$('#searchBox').attr('placeholder'), 'Search ...'); // preprint words needs to be run with ember osf
    assert.equal(this.$('button').text(), 'Search');
});

test('get search info on submit', function(assert) {
    // Tests that the info in the search box is grabbed when the button is clicked

    assert.expect(1);

    this.on('search', function() {
        const query = this.$('#searchBox').val();
        assert.equal(query, 'Test value');
    });

    this.render(hbs`{{search-preprints search="search"}}`);

    this.$('#searchBox').val('Test value');

    this.$('button')[0].click();
});
