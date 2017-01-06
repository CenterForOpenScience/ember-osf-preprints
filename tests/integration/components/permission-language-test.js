import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

moduleForComponent('permission-language', 'Integration | Component | permission language', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  let providerModel = Ember.Object.create({
      engrXiv: {name:'engrXiv'},
      SocArXiv: {name:'SocArXiv'},
      PsyArXiv: {name:'PsyArXiv'}
    });

  this.set('providerModel', providerModel);


  this.render(hbs`{{permission-language model=providerModel.engrXiv}}`);

  assert.equal(this.$().text().trim(), 'arXiv is a trademark of Cornell University, used under license. This license should not be understood to indicate endorsement of content on engrXiv by Cornell University or arXiv.');

  this.render(hbs`{{permission-language model=providerModel.SocArXiv}}`);

  assert.equal(this.$().text().trim(), 'arXiv is a trademark of Cornell University, used under license.');

  this.render(hbs`{{permission-language model=providerModel.PsyArXiv}}`);

  assert.equal(this.$().text().trim(), 'arXiv is a trademark of Cornell University, used under license. This license should not be understood to indicate endorsement of content on PsyArXiv by Cornell University or arXiv.');



  // Template block usage:
  this.render(hbs`
    {{#permission-language}}
      template block text
    {{/permission-language}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
