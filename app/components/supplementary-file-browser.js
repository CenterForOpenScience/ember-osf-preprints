import Component from '@ember/component';
import { computed, observer } from '@ember/object';
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
export default Component.extend(Analytics, {
    elementId: 'preprint-file-view',
    endIndex: 6,
    startIndex: 0,

    scrollAnim: '',
    selectedFile: null,

    hasAdditionalFiles: computed('files', function() {
        return this.get('files.length') > 1;
    }),

    hasPrev: computed('files', 'endIndex', 'startIndex', function() {
        return this.get('startIndex') > 0;
    }),

    hasNext: computed('files', 'endIndex', 'startIndex', function() {
        return this.get('endIndex') < this.get('files.length');
    }),


    selectedFileChanged: computed('selectedFile', function() {
        const eventData = {
            file_views: {
                preprint: {
                    type: 'preprint',
                    id: this.get('preprint.id'),
                },
                file: {
                    id: this.get('selectedFile.id'),
                    primaryFile: this.get('preprint.primaryFile.id') === this.get('selectedFile.id'),
                    version: this.get('selectedFile.currentVersion'),
                },
            },
        };
        this.get('metrics').invoke('trackSpecificCollection', 'Keen', {
            collection: 'preprint-file-views',
            eventData,
            node: this.get('node'),
        });
    }),
    fileDownloadURL: computed('selectedFile', function() {
        return fileDownloadPath(this.get('selectedFile'), this.get('node'));
    }),
    _chosenFile: observer('chosenFile', 'indexes', function() { /* eslint-disable-line ember/no-observers */
        const fid = this.get('chosenFile');
        const index = this.get('indexes') && this.get('indexes').indexOf(fid);
        if (fid && index !== -1) {
            this.set('selectedFile', this.get('files')[index]);
        }
    }),
    _moveIfNeeded: observer('selectedFile', function() { /* eslint-disable-line ember/no-observers */
        const index = this.get('files') && this.get('files').indexOf(this.get('selectedFile'));
        if (index < 0) {
            return;
        }
        if (index >= this.get('endIndex') || index < this.get('startIndex')) {
            const max = this.get('files').length - 6;
            if (index > max) {
                this.set('startIndex', max);
                this.set('endIndex', this.get('files').length);
            } else {
                this.set('startIndex', index);
                this.set('endIndex', index + 6);
            }
        }
    }),

    // This needs to be changed away from an observer, but "preprint" changes
    // frequently enough that it is really complicated
    __files: observer('preprint', function() { /* eslint-disable-line ember/no-observers */
        this.set('files', []);
        this.set('selectedFile', null);
        /* eslint-disable ember/named-functions-in-promises */
        this.get('node').get('files')
            .then((fileProviders) => {
                this.set('fileProvider', fileProviders.findBy('name', 'osfstorage'));
                return loadAll(this.get('fileProvider'), 'files', this.get('files'), { 'page[size]': 50 });
            })
            .then(() => this.get('preprint').get('primaryFile'))
            .then((pf) => {
                this.get('files').removeObject(pf);
                this.set('primaryFile', pf);
                this.set('selectedFile', this.get('primaryFile'));
                this.set('files', [this.get('primaryFile')].concat(this.get('files')));
                this.set('indexes', this.get('files').map(each => each.id));
            });
        /* eslint-enable ember/named-functions-in-promises */
    }),
    init() {
        this._super(...arguments);
        this.__files();
    },
    actions: {
        next(direction) {
            this.get('metrics')
                .trackEvent({
                    category: 'file browser',
                    action: 'click',
                    label: 'Content - Next',
                });

            if (this.get('endIndex') > this.get('files.length')) return;

            this.set('scrollAnim', `to${direction}`);
            this.set('endIndex', this.get('endIndex') + 5);
            this.set('startIndex', this.get('startIndex') + 5);
        },
        prev(direction) {
            this.get('metrics')
                .trackEvent({
                    category: 'file browser',
                    action: 'click',
                    label: 'Content - Prev',
                });
            const start = this.get('startIndex');
            if (start <= 0) return;

            this.set('scrollAnim', `to${direction}`);
            if ((start - 5) < 0) {
                this.set('startIndex', 0);
                this.set('endIndex', 6);
            } else {
                this.set('startIndex', start - 5);
                this.set('endIndex', this.get('endIndex') - 5);
            }
        },
        changeFile(file) {
            this.get('metrics')
                .trackEvent({
                    category: 'file browser',
                    action: 'select',
                    label: 'Content - File',
                });

            this.set('selectedFile', file);
            if (this.chooseFile) {
                this.chooseFile(file);
            }
        },
    },
});
