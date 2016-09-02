import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

moduleForComponent('supplementary-file-browser', 'Integration | Component | supplementary file browser', {
    integration: true
});

test('it renders', function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    // Construct a fake preprint object to satisfy browser needs
    let providerFiles = () => Ember.RSVP.resolve(Ember.ArrayProxy.create({
        content: Ember.A(),
        meta: {
            pagination: {
                total: 1
            }
        }}));
    let providersQuery =  Ember.RSVP.resolve(Ember.A([{
            name: 'osfstorage',
            query: providerFiles
    }]));
    let preprint = Ember.Object.create({
        files: providersQuery
    });

    this.set('preprint', preprint);

    this.render(hbs`{{supplementary-file-browser preprint=preprint}}`);

    assert.equal(this.$().text().trim(), '');

    //  this.on('changeFile', function() {});
});

//   {{supplementary-file-browser preprint=model projectURL=model.links.html chooseFile=(action 'chooseFile')}}
