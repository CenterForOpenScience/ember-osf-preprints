import Ember from 'ember';
import DS from 'ember-data';
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
 *      chosenFile=fileId
 *      chooseFile=(action 'chooseFile')
 * }}
 * ```
 * @class supplementary-file-browser
 */
export default Ember.Component.extend(Analytics, {
    elementId: 'preprint-file-view',

    // Max number of objects to show before showing next/prev buttons
    width: 6,

    max: Ember.computed('files', 'width', function() {
        return Math.max(this.get('files.length') - this.get('width'), 0);
    }),

    startIndex: Ember.computed('selectedIndex', 'width', function() {
        const selectedIndex = this.get('selectedIndex') || 0;
        const width = this.get('width');

        return Math.floor(selectedIndex / width) * width;
    }),

    endIndex: Ember.computed('selectedIndex', 'width', function() {
        const selectedIndex = this.get('selectedIndex') || 0;
        const width = this.get('width');

        return Math.ceil(selectedIndex / width) * width;
    }),

    scrollAnim: '',

    hasAdditionalFiles: Ember.computed.gt('files.length', 1),

    hasPrev: Ember.computed.gt('startIndex', 0),

    hasNext: Ember.computed('endIndex', 'files.length', function() {
        return this.get('endIndex') < this.get('files.length');
    }),

    versions: Ember.computed('selectedFile', function() {
        const selectedFile = this.get('selectedFile');

        if (!selectedFile) {
            return Ember.A();
        }

        const downloadUrl = selectedFile.get('links.download');
        const filename = selectedFile.get('name');

        return DS.PromiseArray.create({
            promise: this.get('selectedFile')
                .query('versions', {sort: '-id'})
                .then(versions => versions
                    .map(version => {
                        const dateFormatted = encodeURIComponent(version.get('dateCreated').toISOString());
                        const displayName = filename.replace(/(\.\w+)?$/, ext => `-${dateFormatted}${ext}`);
                        version.set('downloadUrl', `${downloadUrl}?version=${version.id}&displayName=${displayName}`);
                        return version;
                    })
                )
        });
    }),

    selectedFileisPrimaryFile: Ember.computed.equal('selectedIndex', 0),

    fileRenderURL: Ember.computed('selectedFile.links.download', 'selectedVersion', function() {
        const downloadUrl = this.get('selectedFile.links.download');
        const selectedVersion = this.get('selectedVersion');

        return (downloadUrl && selectedVersion) ? `${downloadUrl}?version=${selectedVersion}` : null;
    }),

    fileDownloadURL: Ember.computed('selectedFile', 'selectedVersion', function() {
        return fileDownloadPath(this.get('selectedFile'), this.get('node'));
    }),

    init() {
        this._super(...arguments);

        this.setProperties({
            files: Ember.A(),
            selectedFile: null,
            selectedIndex: null,
        });

        return Promise
            .all([
                this.get('preprint.primaryFile'),
                this.get('node.files')
                    .then(providers => loadAll(
                        providers.findBy('name', 'osfstorage'),
                        'files',
                        this.get('files'),
                        {
                            'page[size]': 50
                        }
                    ))
            ])
            .then(([primaryFile]) => {
                const files = this.get('files');

                files.removeObject(primaryFile);
                files.unshiftObject(primaryFile);

                const selectedFile = files.find(({id}) => id === this.get('chosenFile')) || primaryFile;

                this.setProperties({
                    files,
                    primaryFile,
                    selectedFile,
                    selectedIndex: files.indexOf(selectedFile),
                });
            });
    },

    actions: {
        next(direction) {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'file browser',
                    action: 'click',
                    label: 'Content - Next'
                });

            const endIndex = this.get('endIndex');

            if (endIndex > this.get('files.length')) {
                return;
            }

            const width = this.get('width');

            this.setProperties({
                scrollAnim: `to${direction}`,
                startIndex: this.get('startIndex') + width,
                endIndex: endIndex + width,
            });
        },
        prev(direction) {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'file browser',
                    action: 'click',
                    label: 'Content - Prev'
                });

            const startIndex = this.get('startIndex');

            if (startIndex <= 0) {
                return;
            }

            const width = this.get('width');

            this.setProperties({
                scrollAnim: `to${direction}`,
                startIndex: Math.max(startIndex - width, 0),
                endIndex: Math.max(this.get('endIndex') - width, width)
            });
        },
        changeFile(selectedFile, selectedIndex) {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'file browser',
                    action: 'select',
                    label: 'Content - File'
                });

            this.setProperties({
                selectedFile,
                selectedIndex,
            });

            if (this.attrs.chooseFile) {
                this.sendAction('chooseFile', selectedFile);
            }
        }
    },
});
