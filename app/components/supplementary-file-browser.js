import Ember from 'ember';
import loadAll from 'ember-osf/utils/load-relationship';
import Analytics from '../mixins/analytics';
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
 * }}
 * ```
 * @class supplementary-file-browser
 */
export default Ember.Component.extend(Analytics, {
    elementId: 'preprint-file-view',
    endIndex: 6,
    startIndex: 0,

    scrollAnim: '',
    selectedFile: null,
    versions: () => [],

    hasAdditionalFiles: function() {
        return this.get('files.length') > 1;
    }.property('files'),

    hasPrev: function() {
        return this.get('startIndex') > 0;
    }.property('files', 'endIndex', 'startIndex'),

    hasNext: function() {
        return this.get('endIndex') < this.get('files.length');
    }.property('files', 'endIndex', 'startIndex'),

    __files: function() {
        this.set('files', []);
        this.set('selectedFile', null);

        return Promise
            .all([
                this.get('node')
                    .get('files')
                    .then(providers => {
                        this.set('provider', providers.findBy('name', 'osfstorage'));
                        return loadAll(this.get('provider'), 'files', this.get('files'), {'page[size]': 50});
                    }),
                this.get('preprint.primaryFile')
            ])
            .then(([, pf]) => {
                this.get('files').removeObject(pf);
                this.set('primaryFile', pf);
                this.set('selectedFile', pf);
                this.set('files', [pf, ...this.get('files')]);
            });
    }.observes('preprint'),

    selectedFileChanged: Ember.observer('selectedFile', function() {
        const selectedFile = this.get('selectedFile');
        this.set('versions', []);

        if (!selectedFile)
            return;

        this.set('selectedVersion', selectedFile.get('currentVersion'));

        return selectedFile
            .query('versions', {sort: '-identifier'})
            .then(versions => this.set('versions', versions));
    }),

    fileRenderURL: Ember.computed('selectedFile.links.download', 'selectedVersion', function() {
        const downloadUrl = this.get('selectedFile.links.download');
        const selectedVersion = this.get('selectedVersion');

        return (downloadUrl && selectedVersion) ? `${downloadUrl}?version=${selectedVersion}` : null;
    }),

    fileDownloadURL: Ember.computed('selectedFile', 'selectedVersion', function() {
        return fileDownloadPath(this.get('selectedFile'), this.get('node'), this.get('selectedVersion'));
    }),

    init() {
        this._super(...arguments);
        this.__files();

    },
    actions: {
        next(direction) {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'file browser',
                    action: 'click',
                    label: 'Preprints - Content - Next'
                });

            if (this.get('endIndex') > this.get('files.length')) return;

            this.set('scrollAnim', `to${direction}`);
            this.set('endIndex', this.get('endIndex') + 5);
            this.set('startIndex', this.get('startIndex') + 5);
        },
        prev(direction) {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'file browser',
                    action: 'click',
                    label: 'Preprints - Content - Prev'
                });

            if (this.get('startIndex') <= 0) return;

            this.set('scrollAnim', `to${direction}`);
            this.set('endIndex', this.get('endIndex') - 5);
            this.set('startIndex', this.get('startIndex') - 5);
        },
        changeFile(file) {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'file browser',
                    action: 'select',
                    label: 'Preprints - Content - File'
                });

            this.set('selectedFile', file);

            if (this.attrs.chooseFile) {
                this.sendAction('chooseFile', file);
            }
        },
        changeVersion(version) {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'file browser',
                    action: 'select',
                    label: 'Preprints - Content - Version'
                });

            this.set('selectedVersion', version);
        }
    },
});
