import { merge } from '@ember/polyfills';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import FactoryGuy, { manualSetup } from 'ember-data-factory-guy';

moduleForComponent('author-link', 'Integration | Component | author link', {
    integration: true,
    beforeEach() {
        manualSetup(this.container);
    },
});

test('renders non-links', function(assert) {
    const contributorModel = FactoryGuy.make('contributor');
    // Problem here is that author link expects a share search-result contributor,
    // not a store instance of a contributor and its user(s).
    let contributor = { users: { identifiers: [] } };
    contributor.users.name = contributorModel.get('users.fullName');
    contributor = merge(contributor, contributorModel.serialize().data.attributes);
    this.set('contributor', contributor);
    this.render(hbs`{{author-link contributor=contributor}}`);
    assert.ok(!this.$('a').length, 'Found a link when user has no identifiers');
    assert.equal(this.$().text().trim(), contributorModel.get('users.fullName'), 'Text of author-link not equal to fullName of user');
});

test('renders links', function(assert) {
    const contributorModel = FactoryGuy.make('contributor');
    let contributor = { users: { identifiers: [] } };
    contributor.users.name = contributorModel.get('users.fullName');
    contributor = merge(contributor, contributorModel.serialize().data.attributes);
    contributor.users.identifiers.push('https://staging.osf.io/cool');
    this.set('contributor', contributor);

    this.render(hbs`{{author-link contributor=contributor}}`);
    assert.ok(this.$('a').length, 'Expected a link in author-link as user has an identifier');
    assert.equal(this.$().text().trim(), contributorModel.get('users.fullName'), 'Text of author-link not equal to fullName of user');
});
