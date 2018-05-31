import EmberObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';


moduleForComponent('provider-carousel', 'Integration | Component | provider carousel', {
    integration: true,
});

test('it renders', function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    this.set('provider1', EmberObject.create({ id: 'asu' }));
    this.set('provider2', EmberObject.create({ id: 'psyarxiv' }));
    this.set('provider3', EmberObject.create({ id: 'socarxiv' }));
    this.set('provider4', EmberObject.create({ id: 'engrxiv' }));
    this.set('provider5', EmberObject.create({ id: 'osf' }));
    this.set('provider6', EmberObject.create({ id: 'testprovider' }));
    this.set('provider7', EmberObject.create({ id: 'testprovider2' }));

    this.set('providers', [this.get('provider1'), this.get('provider2'), this.get('provider3'),
        this.get('provider4'), this.get('provider5'), this.get('provider6'), this.get('provider7')]);
    this.render(hbs`{{provider-carousel
      providers=providers
    }}`);
    assert.ok(/^\s*Previous\s*Next\s*$/.test(this.$().text()));
});
