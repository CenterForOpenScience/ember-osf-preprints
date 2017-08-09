import Ember from 'ember';
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
        this.get('node').get('files')
            .then(providers => {
                this.set('provider', providers.findBy('name', 'osfstorage'));
                return loadAll(this.get('provider'), 'files', this.get('files'), {'page[size]': 50});
            })
            .then(() => this.get('preprint').get('primaryFile'))
            .then((pf) => {
                this.get('files').removeObject(pf);
                this.set('primaryFile', pf);
                this.set('selectedFile', this.get('primaryFile'));
                this.set('files', [this.get('primaryFile')].concat(this.get('files')));
                this.set('indexes', this.get('files').map(each => each.id));
            });
    }.observes('preprint'),

    selectedFileChanged: Ember.observer('selectedFile', function() {
        const eventData = {
            file_views: {
                preprint: {
                    type: 'preprint',
                    id: this.get('preprint.id')
                },
                file: {
                    id: this.get('selectedFile.id'),
                    primaryFile: this.get('preprint.primaryFile.id') === this.get('selectedFile.id'),
                    version: this.get('selectedFile.currentVersion')
                }
            }
        };
        Ember.get(this, 'metrics').invoke('trackSpecificCollection', 'Keen', {
            collection: 'preprint-file-views',
            eventData: eventData,
            node: this.get('node'),
        });
    }),

    _chosenFile: Ember.observer('chosenFile', 'indexes', function() {
        let fid = this.get('chosenFile');
        let index = this.get('indexes').indexOf(fid);
        if (fid && index !== -1) {
            this.set('selectedFile', this.get('files')[index]);
        }
    }),
    _moveIfNeeded: Ember.observer('selectedFile', function() {
        let index = this.get('files').indexOf(this.get('selectedFile'));
        if (index < 0) {
            return;
        }
        if (index >= this.get('endIndex') || index < this.get('startIndex')) {
            let max = this.get('files').length - 6;
            if (index > max) {
                this.set('startIndex', max);
                this.set('endIndex', this.get('files').length);
            } else {
                this.set('startIndex', index);
                this.set('endIndex', index + 6);
            }
        }
    }),
    fileDownloadURL: Ember.computed('selectedFile', function() {
        return fileDownloadPath(this.get('selectedFile'), this.get('node'));
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
                    label: 'Content - Next'
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
                    label: 'Content - Prev'
                });
            let start = this.get('startIndex');
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
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'file browser',
                    action: 'select',
                    label: 'Content - File'
                });

            this.set('selectedFile', file);
            if (this.attrs.chooseFile) {
                this.sendAction('chooseFile', file);
            }
        },
    },
});
