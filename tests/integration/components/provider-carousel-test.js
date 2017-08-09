import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

moduleForComponent('provider-carousel', 'Integration | Component | provider carousel', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.set('provider1', Ember.Object.create({id: 'asu'}));
  this.set('provider2', Ember.Object.create({id: 'psyarxiv'}));
  this.set('provider3', Ember.Object.create({id: 'socarxiv'}));
  this.set('provider4', Ember.Object.create({id: 'engrxiv'}));
  this.set('provider5', Ember.Object.create({id: 'osf'}));
  this.set('provider6', Ember.Object.create({id: 'testprovider'}));
  this.set('provider7', Ember.Object.create({id: 'testprovider2'}));

  this.set('providers', [this.get('provider1'), this.get('provider2'), this.get('provider3'),
    this.get('provider4'), this.get('provider5'), this.get('provider6'), this.get('provider7')]);
  this.render(hbs`{{provider-carousel
      providers=providers
  }}`);

  assert.equal(this.$().context.innerText, 'PreviousNext');
});
