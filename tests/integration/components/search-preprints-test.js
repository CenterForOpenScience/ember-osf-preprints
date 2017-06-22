import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

//Stub location service
const themeStub = Ember.Service.extend({
    isProvider: true,
    provider: Ember.RSVP.resolve({
        name: 'OSF',
        additionalProviders: ['Other Provider'],

    })
});

moduleForComponent('search-preprints', 'Integration | Component | search preprints', {
  integration: true,
  beforeEach: function() {
      this.register('service:theme', themeStub);
      this.inject.service('theme');
  }
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  assert.expect(2);

  this.render(hbs`{{search-preprints search="search"}}`);

  assert.equal(this.$('#searchBox').attr('placeholder'), "Search preprints...");
  assert.equal(this.$('button').text(), "Search");

});

test('get search info on submit', function(assert) {
    // Tests that the info in the search box is grabbed when the button is clicked

    assert.expect(1);

    this.on('search', function() {

        let query = this.$('#searchBox').val();
        assert.equal(query, 'Test value');

    });

    this.render(hbs `{{search-preprints search="search"}}`);

    this.$('#searchBox').val('Test value');

    this.$('button')[0].click();

});
