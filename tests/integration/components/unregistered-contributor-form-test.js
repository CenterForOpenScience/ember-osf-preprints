import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('unregistered-contributor-form', 'Integration | Component | unregistered contributor form', {
  integration: true
});

test('form renders', function(assert) {
    const noop = () => {};
    this.set('resetfindContributorsView', noop);
    this.set('addUnregisteredContributor', noop);
    this.render(hbs`{{unregistered-contributor-form 
                       resetfindContributorsView=resetfindContributorsView
                       addUnregisteredContributor=addUnregisteredContributor}}`);


    assert.equal(this.$('label')[0].textContent.trim(), 'Full Name');
    assert.equal(this.$('label')[1].textContent.trim(), 'Email');

});

