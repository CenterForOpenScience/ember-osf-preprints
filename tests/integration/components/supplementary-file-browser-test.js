import { A } from '@ember/array';
import { resolve } from 'rsvp';
import { moduleForComponent, test } from 'ember-qunit';
import ArrayProxy from '@ember/array/proxy';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

moduleForComponent('supplementary-file-browser', 'Integration | Component | supplementary file browser', {
    integration: true,
    beforeEach() {
        const providerFiles = () => resolve(ArrayProxy.create({
            content: A([{ name: 'test folder', kind: 'folder' }, { name: 'chosenFile', kind: 'file' }]),
            meta: {
                pagination: {
                    total: 1,
                },
            },
        }));
        const providersQuery = resolve(A([{
            name: 'osfstorage',
            queryHasMany: providerFiles,
        }]));

        const node = EmberObject.create({
            dateModified: '10-11-2016',
            title: 'My Preprint Title',
            files: providersQuery,
        });

        const file = EmberObject.create({
            name: 'test file',
            currentVersion: '1.12',
            id: 890,
        });
        const preprint = EmberObject.create({
            primaryFile: file,
            node,
            provider: 'osf',
            files: providersQuery,
            id: 890,
        });
        const dualTrackNonContributors = () => {};

        this.set('preprint', preprint);
        this.set('node', node);
        this.set('dualTrackNonContributors', dualTrackNonContributors);
    },
});

function render(context) {
    return context.render(hbs`{{supplementary-file-browser
        preprint=preprint
        node=node
        dualTrackNonContributors=(action dualTrackNonContributors)
    }}`);
}

test('it renders', function(assert) {
    // Tests that the page renders
    this.render(hbs`{{supplementary-file-browser
        preprint=preprint
        node=node
        hasAdditionalFiles=false    
        dualTrackNonContributors=(action dualTrackNonContributors)
    }}`);
    assert.equal(this.$('.osf-box').length, 0);
    assert.equal(this.$('.row p').text(), 'test file');
    assert.equal(this.$('.supplemental-downloads span').text(), ' Version: 1.12');
});

test('has additional files', function(assert) {
    // Tests that additional file section renders
    this.render(hbs`{{supplementary-file-browser
        preprint=preprint
        node=node
        hasAdditionalFiles=true
        hasPrev=true
        hasNext=true
        dualTrackNonContributors=(action dualTrackNonContributors)
    }}`);
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

    const url = this.$('.supplemental-downloads > a').attr('href');
    assert.ok(url);
    assert.ok(url.indexOf(this.get('primaryFile.guid')) !== -1, 'Url does not have file\'s guid in it');
});
