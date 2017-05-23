import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('supplementary-file-browser', 'Integration | Component | supplementary file browser', {
    integration: true,
    beforeEach: function() {
        let providerFiles = () => Ember.RSVP.resolve(Ember.ArrayProxy.create({
            content: Ember.A([{ name: 'test folder', kind: 'folder'}, { name: 'chosenFile', kind: 'file' }]),
            meta: {
                pagination: {
                    total: 1
                }
            }}));
        let providersQuery =  Ember.RSVP.resolve(Ember.A([{
                name: 'osfstorage',
                query: providerFiles
        }]));

        let node = Ember.Object.create({
            dateModified: '10-11-2016',
            title:'My Preprint Title',
            files: providersQuery
        });

        let file = Ember.Object.create({
            name: 'test file',
            currentVersion: '1.12',
            id: 890
        });
        let preprint = Ember.Object.create({
            primaryFile: file,
            node: node,
            provider: 'osf',
            files: providersQuery,
            id: 890
        });
        this.set('preprint', preprint);
        this.set('node', node);
    }
});

function render(context, componentArgs) {
    return context.render(Ember.HTMLBars.compile(`{{supplementary-file-browser
        preprint=preprint
        node=node
        ${componentArgs || ''}
    }}`));
}

test('it renders', function(assert) {
    // Tests that the page renders
    render(this, 'hasAdditionalFiles=false');
    assert.equal(this.$('.osf-box').length, 0);
    assert.equal(this.$('.row p').text(), 'test file');
    assert.equal(this.$('.supplemental-downloads span').text(), ' Version: 1.12');

});

test('has additional files', function(assert) {
    // Tests that additional file section renders
    render(this, 'hasAdditionalFiles=true hasPrev=true hasNext=true');

    // Checks for elements to render
    assert.equal(this.$('.osf-box').length, 1);
    assert.equal(this.$('#leftArrow').length, 1);
    assert.equal(this.$('#upArrow').length, 1);
    assert.equal(this.$('#rightArrow').length, 1);
    assert.equal(this.$('#downArrow').length, 1);

    // Checks for different file types to render differently
    assert.ok(this.$('i.fa-folder').length);
    assert.ok(this.$('i.preprint-image').length);
    assert.ok(this.$('i.fa-file-text').length);
});

test('fileDownloadURL computed property', function (assert) {
    render(this);

    let url = this.$('.supplemental-downloads > a').attr('href')
    assert.ok(url);
    assert.ok(url.indexOf(this.get('primaryFile.guid')) !== -1, 'Url does not have file\'s guid in it');
});
