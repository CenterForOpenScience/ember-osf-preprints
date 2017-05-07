import Ember from 'ember';
import { moduleForComponent, test, skip } from 'ember-qunit';

moduleForComponent('supplementary-file-browser', 'Integration | Component | supplementary file browser', {
    integration: true,
    beforeEach: function() {
        const versions = () => Ember.RSVP.resolve(
            Ember.ArrayProxy.Create({
                content: Ember.A([
                    {
                        dateCreated: new Date(),
                    }
                ]),
                meta: {
                    pagination: {
                        total: 1
                    }
                }
            })
        );

        const query = () => Ember.RSVP.resolve(
            Ember.ArrayProxy.create({
                content: Ember.A([
                    {
                        name: 'test folder',
                        kind: 'folder'
                    },
                    {
                        name: 'chosenFile',
                        kind: 'file',
                        versions
                    }
                ]),
                meta: {
                    pagination: {
                        total: 1
                    }
                }
            })
        );

        const files = Ember.RSVP.resolve(
            Ember.A([
                {
                    name: 'osfstorage',
                    query
                }
            ])
        );

        const node = Ember.Object.create({
            dateModified: '10-11-2016',
            title: 'My Preprint Title',
            files,
        });

        const file = Ember.Object.create({
            name: 'test file',
            currentVersion: 1,
            id: 890
        });

        const preprint = Ember.Object.create({
            primaryFile: file,
            node,
            provider: 'osf',
            files,
            id: 890
        });

        this.setProperties({
            preprint,
            node,
            files,
        });

        this.set('preprint', preprint);
    }
});

function render(context, componentArgs='') {
    return context.render(
        Ember.HTMLBars.compile(`
            {{supplementary-file-browser
                preprint=preprint
                node=node
                ${componentArgs}
            }}
        `)
    );
}

test('it renders', function(assert) {
    // Tests that the page renders
    render(this, 'hasAdditionalFiles=false');
    assert.equal(this.$('.osf-box').length, 0);
    // TODO enable when tests are fixed
    // assert.equal(this.$('#selectedFileName').text().trim(), 'test file');
    assert.equal(this.$('.supplemental-downloads span').text().trim(), 'Version:');
    assert.equal(this.$('#previousVersionsDropdown').text().trim(), 'Download previous versions');
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

    // TODO enable when when tests are fixed
    // Checks for different file types to render differently
    // assert.ok(this.$('i.fa-folder').length);
    // assert.ok(this.$('i.preprint-image').length);
    // assert.ok(this.$('i.fa-file-text').length);
});

skip('fileDownloadURL computed property', function (assert) {
    render(this);

    const url = this.$('#downloadPreprintButton').attr('href');
    assert.ok(url.includes(this.get('primaryFile.guid')), 'Url does not have file\'s guid in it');
});
