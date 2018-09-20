import { A } from '@ember/array';
import RSVP, { resolve } from 'rsvp';
import { moduleForComponent, test } from 'ember-qunit';
import wait from 'ember-test-helpers/wait';
import Service from '@ember/service';
import ArrayProxy from '@ember/array/proxy';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

const themeStub = Service.extend({
    isProvider: true,
    provider: RSVP.resolve(EmberObject.create({
        name: 'OSF',
        allowCommenting: false,
        additionalProviders: ['Other Provider'],
    })),
});

moduleForComponent('supplementary-file-browser', 'Integration | Component | supplementary file browser', {
    integration: true,
    beforeEach() {
        const fileVersions = () => resolve(ArrayProxy.create({
            content: A([
                EmberObject.create({ size: 4, dateCreated: new Date('05 October 2011 14:48 UTC') }),
                EmberObject.create({ size: 5, dateCreated: new Date('05 October 2011 14:49 UTC') }),
            ]),
            meta: {
                pagination: {
                    total: 1,
                },
            },
        }));

        const providerFiles = () => resolve(ArrayProxy.create({
            content: A([
                EmberObject.create({
                    id: 345, name: 'test folder', kind: 'folder',
                }),
                EmberObject.create({ id: 350, name: 'chosenFile', kind: 'file' }),
            ]),
            meta: {
                pagination: {
                    total: 3,
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
            queryHasMany: fileVersions,
            links: { download: '/link/to/download/url' },
        });

        const preprint = EmberObject.create({
            primaryFile: file,
            node,
            provider: 'osf',
            files: providersQuery,
            id: 890,
        });

        const dualTrackNonContributors = () => {};

        this.register('service:theme', themeStub);
        this.inject.service('theme');

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
    return wait().then(() => {
        assert.equal(this.$('.osf-box').length, 0);
        assert.equal(this.$('#selectedFileName').text(), 'test file');
        assert.equal(this.$('#currentVersion').text(), 'Version: 1.12');
    });
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
    return wait().then(() => {
        assert.ok(this.$('i.fa-folder').length);
        assert.ok(this.$('i.preprint-image').length);
        assert.ok(this.$('i.fa-file-text').length);
    });
});

test('fileDownloadURL computed property', function (assert) {
    render(this);

    return wait().then(() => {
        const url = this.$('#primaryFileDownloadUrl').attr('href');
        assert.ok(url);
        assert.ok(url.indexOf(this.get('primaryFile.guid')) !== -1, 'Url does not have file\'s guid in it');
    });
});
