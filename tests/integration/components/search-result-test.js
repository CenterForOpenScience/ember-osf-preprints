import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('search-result', 'Integration | Component | search result', {
    integration: true,
    beforeEach: function() {
        let noop = () => {};
        this.set('noop', noop);
    }
});

let result = Ember.Object.extend({
    identifiers: [],
    contributors: [{ users: ({ bibliographic: 'Todd Frak', name: 'Todd Frak', identifiers: 'kjhg85' }) }],
    subjects: [({ text: 'psychology' })],
    providers: [{ name: 'test provider1' }, { name: 'test provider2' }],
    infoLinks: [{ type: 'url', uri: 'test URI1' }, { type: 'test', uri: 'testURI2' }],
    title: 'Tests to live by',
    date: '04-19-2017',
    dateModified: '04-20-2017',
    abstract: "This is just a test",
    description: 'test text to test'
});

function render(context, componentArgs) {
    return context.render(Ember.HTMLBars.compile(`{{search-result
        select=(action noop '')
        ${componentArgs || ''}
    }}`));
}

test('it renders', function(assert) {
    // Tests that it renders properly without osfID or hyperlink
    // Currently cannot render because of MathJax error

    assert.ok('ok');

    let preprint = result.create();
    this.set('preprint', preprint);
    render(this, 'result=preprint hasMoreContributors=true');

    assert.ok(this.$('.search-result').length);
    assert.ok(this.$('.text-center').length);

    // Checks that the title renders without a link (no hyperlink or osfID in the object)
    assert.ok(this.$('span:contains(Tests to live by)').length);

    assert.ok(this.$('.comma-list').text(), 'Todd Frak ...');
    assert.ok(this.$('em:contains(2017-04-19)'));
    assert.ok(this.$('.subject-preview:contains(psychology)'));
    assert.ok(this.$('.text-muted').length);
    assert.ok(this.$('.search-result-providers:contains(test provider1 | test provider2)'));
    assert.ok(this.$('span:contains(April 2017)'));


});

test('showBody renders', function(assert) {
    // Tests that elements under showBody render properly
    let preprint = result.create({
        hyperLinks: [{ title: 'test title', url: 'http://google.com' }, { title: 'test title 2', url: 'http://osf.io' }],
        infoLinks: [{ type: 'test type 1', uri: 'ksavmz740asd' }, {type: 'test type 2', uri: 'asdkjr48avn'}],
        tags: 'test tag'
    });
    this.set('preprint', preprint);
    render(this, 'result=preprint showBody=true');

    assert.equal(this.$('.preprints-block-list').length, 2);
    assert.ok(this.$('.badge').length);

});

test('render title with osfID', function(assert) {
    // Tests that the component renders the title as a link when an osfID is passed
    let preprint = result.create();
    this.set('preprint', preprint);
    render(this, 'result=preprint osfID="asdk4040"');

    assert.ok(this.$('a:contains(Tests to live by)'));

});

test('render title with hyperlink', function(assert) {
    // Tests that the component render the title as a link when a hyperlink is passed
    let preprint = result.create();
    this.set('preprint', preprint);
    render(this, 'result=preprint hyperlink="http://osf.io"');

    assert.equal(this.$('a:contains(Tests to live by)').attr('href'), 'http://osf.io');

});
