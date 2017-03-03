import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import FactoryGuy, { manualSetup } from 'ember-data-factory-guy';

moduleForComponent('author-link', 'Integration | Component | author link', {
    integration: true
});

test('renders links and non-links', function(assert) {

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    manualSetup(this.container);
    let contributorModel = FactoryGuy.make('contributor');
    // Problem here is that author link expects a share search-result contributor,
    // not a store instance of a contributor and its user(s).
    let contributor = {users: {identifiers: []}};
    contributor.users.name = contributorModel.get('users.fullName');
    contributor = Ember.merge(contributor, contributorModel.serialize().data.attributes)
    this.set('contributor', contributor);

    this.render(hbs`{{author-link contributor=contributor}}`);
    assert.ok(!this.$().has('a').length)
    assert.equal(this.$().text().trim(), contributorModel.get('users.fullName'));

    contributor.users.identifiers.push('https://staging.osf.io/cool');
    this.set('contributor', contributor);

    this.render(hbs`{{author-link contributor=contributor}}`);
    assert.ok(this.$().has('a').length)
    assert.equal(this.$().text().trim(), contributorModel.get('users.fullName'));
});
