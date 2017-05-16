import Ember from 'ember';
import {make, manualSetup, mockQuery, mockQueryRecord, mockFindRecord}  from 'ember-data-factory-guy';
import {moduleForComponent, test, skip} from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('supplementary-file-browser', 'Integration | Component | supplementary file browser', {
    integration: true,
    beforeEach: function () {
        manualSetup(this.container);
    }
});

test('it renders', function (assert) {
    Ember.run(() => {
        assert.expect(1);

        const primaryFile = make('file', {
            name: 'testfile.txt',
            versions: [
                make('file-version', {id: 1}),
                make('file-version', {id: 2})
            ],
        });

        mockFindRecord('file').returns({model: primaryFile});

        // mockQuery('files');

        // mockQueryRecord('file').returns({model: primaryFile});

        const supplementaryFile = make('file');

        const files = Ember.A([
            primaryFile,
            supplementaryFile
        ]);

        mockQueryRecord('file').returns({ model: primaryFile });

        mockQuery('file-provider').returns({ models: files });

        const fileProvider = make('file-provider', {
            files,
        });

        const node = make('node', {
            public: true,
            files: [ fileProvider ]
        });

        const model = make('preprint', 'hasBeenPublished', {
            primaryFile,
            node,
            provider: 'osf',
            files,
        });

        this.setProperties({
            model,
            node,
        });

        this.render(hbs`{{supplementary-file-browser
            preprint=model
            node=node
        }}`);

        return wait().then(() => {
            assert.strictEqual(this.$('#selectedFileName').text().trim(), 'testfile.txt');
        });
    });

});

// skip('has additional files', function(assert) {
//     // Tests that additional file section renders
//     render(this, 'hasAdditionalFiles=true hasPrev=true hasNext=true');
//
//     // Checks for elements to render
//     assert.equal(this.$('.osf-box').length, 1);
//     assert.equal(this.$('#leftArrow').length, 1);
//     assert.equal(this.$('#upArrow').length, 1);
//     assert.equal(this.$('#rightArrow').length, 1);
//     assert.equal(this.$('#downArrow').length, 1);
//
//     // TODO enable when when tests are fixed
//     // Checks for different file types to render differently
//     // assert.ok(this.$('i.fa-folder').length);
//     // assert.ok(this.$('i.preprint-image').length);
//     // assert.ok(this.$('i.fa-file-text').length);
// });
//
skip('fileDownloadURL computed property', function (assert) {
    // render(this);

    const url = this.$('#downloadPreprintButton').attr('href');
    assert.ok(url.includes(this.get('primaryFile.guid')), 'Url does not have file\'s guid in it');
});
