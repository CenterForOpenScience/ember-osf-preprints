import Ember from 'ember';
import Component from '@ember/component';
import { task } from 'ember-concurrency';
import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import loadAll from 'ember-osf/utils/load-relationship';
import Analytics from 'ember-osf/mixins/analytics';
import fileDownloadPath from '../utils/file-download-path';

/**
 * @module ember-preprints
 * @submodule components
 */

/**
 * Displays supplemental preprint files
 *
 * Sample usage:
 * ```handlebars
 * {{supplementary-file-browser
 *      preprint=model
 *      node=node
 *      projectURL=node.links.html
 *      chooseFile=(action 'chooseFile')
 *      provider=model.provider
 * }}
 * ```
 * @class supplementary-file-browser
 */

const { A } = Ember;
const { PromiseArray } = DS;

export default Component.extend(Analytics, {
    theme: service(),

    elementId: 'preprint-file-view',
    maxFilesDisplayed: 6, // Max number of files displayed in suppl. files carousel
    scrollAnim: '',
    selectedFile: null,
    allowCommenting: false,

    hasAdditionalFiles: computed.gt('files.length', 1),
    hasPrev: computed.gt('startIndex', 0),
    selectedFileIsPrimaryFile: computed.equal('selectedIndex', 0),

    primaryFileHasVersions: computed('selectedFileIsPrimaryFile', 'versions', function() {
        const versions = this.get('versions');
        if (!versions) return;

        return this.get('selectedFileIsPrimaryFile') && versions.length > 1;
    }),

    startIndex: computed('selectedIndex', 'maxFilesDisplayed', function() {
        const selectedIndex = this.get('selectedIndex') || 0;
        const maxFilesDisplayed = this.get('maxFilesDisplayed');

        return Math.floor(selectedIndex / maxFilesDisplayed) * maxFilesDisplayed;
    }),

    endIndex: computed('selectedIndex', 'maxFilesDisplayed', function() {
        const maxFilesDisplayed = this.get('maxFilesDisplayed');
        const selectedIndex = this.get('selectedIndex') || maxFilesDisplayed;

        return Math.ceil(selectedIndex / maxFilesDisplayed) * maxFilesDisplayed;
    }),

    hasNext: computed('files.length', 'endIndex', function() {
        return this.get('endIndex') < this.get('files.length');
    }),

    versions: computed('selectedFile', function() {
        const selectedFile = this.get('selectedFile');

        if (!selectedFile || !this.get('selectedFileIsPrimaryFile')) {
            return A();
        }

        const versions = A();

        return PromiseArray.create({
            promise: loadAll(selectedFile, 'versions', versions, { sort: '-id', 'page[size]': 50 })
                .then(this.__serializeVersions.bind(this, versions)),
        });
    }),

    fileRendererURL: computed('selectedFile.links.download', 'selectedVersion', function() {
        const downloadUrl = this.get('selectedFile.links.download');
        const selectedVersion = this.get('selectedVersion');

        return (downloadUrl && selectedVersion) ? `${downloadUrl}?version=${selectedVersion}` : null;
    }),

    fileDownloadURL: computed('selectedFile', 'selectedVersion', function() {
        return fileDownloadPath(this.get('selectedFile'), this.get('node'));
    }),

    updateFiles: computed('preprint', function() {
        this.get('getFiles').perform();
    }),

    init() {
        this._super(...arguments);
        this.setProperties({
            files: A(),
            selectedFile: null,
            selectedIndex: null,
        });
        this.get('getFiles').perform();
    },

    didReceiveAttrs() {
        this.get('theme.provider').then(provider => this.setAllowCommenting(provider));
    },

    actions: {
        next(direction) {
            this.get('metrics')
                .trackEvent({
                    category: 'file browser',
                    action: 'click',
                    label: 'Content - Next',
                });

            const endIndex = this.get('endIndex');

            if (endIndex > this.get('files.length')) {
                return;
            }

            const maxFilesDisplayed = this.get('maxFilesDisplayed');

            this.setProperties({
                scrollAnim: `to${direction}`,
                startIndex: this.get('startIndex') + maxFilesDisplayed,
                endIndex: endIndex + maxFilesDisplayed,
            });
        },
        prev(direction) {
            this.get('metrics')
                .trackEvent({
                    category: 'file browser',
                    action: 'click',
                    label: 'Content - Prev',
                });

            const startIndex = this.get('startIndex');

            if (startIndex <= 0) {
                return;
            }

            const maxFilesDisplayed = this.get('maxFilesDisplayed');

            this.setProperties({
                scrollAnim: `to${direction}`,
                startIndex: Math.max(startIndex - maxFilesDisplayed, 0),
                endIndex: Math.max(this.get('endIndex') - maxFilesDisplayed, maxFilesDisplayed),
            });
        },
        changeFile(selectedFile, selectedIndex) {
            this.get('metrics')
                .trackEvent({
                    category: 'file browser',
                    action: 'select',
                    label: 'Content - File',
                });

            this.setProperties({
                selectedFile,
                selectedIndex,
            });

            if (this.chooseFile) {
                this.chooseFile(selectedFile);
            }
        },
    },
    setAllowCommenting(provider) {
        // NOTE: the public check will likely need to be removed after the node-preprint divorce
        const publishedAndPublic = this.get('preprint.isPublished') && this.get('node.public');
        this.set('allowCommenting', provider.get('allowCommenting') && publishedAndPublic);
    },
    __serializeVersions(versions) {
        const downloadUrl = this.get('selectedFile.links.download');
        const filename = this.get('selectedFile.name');

        if (this.get('selectedFileIsPrimaryFile')) {
            this.set('primaryFileHasVersions', versions.length > 1);
        }

        return versions
            .map((version) => {
                const dateFormatted = encodeURIComponent(version.get('dateCreated').toISOString());
                const displayName = filename.replace(/(\.\w+)?$/, ext => `-${dateFormatted}${ext}`);
                version.set('downloadUrl', `${downloadUrl}?version=${version.id}&displayName=${displayName}`);
                return version;
            });
    },
    __initProperties(primaryFile) {
        const files = this.get('files');

        files.removeObject(primaryFile);
        files.unshiftObject(primaryFile);

        const selectedFile = files.find(({ id }) => id === this.get('chosenFile')) || primaryFile;

        this.setProperties({
            primaryFile,
            selectedFile,
            files,
            selectedIndex: files.indexOf(selectedFile),
        });
    },
    getFiles: task(function* () {
        const providers = yield this.get('node.files');
        yield loadAll(
            providers.findBy('name', 'osfstorage'),
            'files',
            this.get('files'),
            {
                'page[size]': 50,
            },
        );
        const primaryFile = yield this.get('preprint.primaryFile');
        this.__initProperties(primaryFile);
    }),
});
