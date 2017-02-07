import Ember from 'ember';
import loadAll from 'ember-osf/utils/load-relationship';
import Analytics from '../mixins/analytics';
import KeenTracker from 'ember-osf/mixins/keen-tracker';

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
export default Ember.Component.extend(Analytics, KeenTracker, {
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
                    primaryFile: this.get('preprint.primaryFile.id') === this.get('selectedFile.id')
                }
            }
        };
        this.keenTrackEvent('preprint_file_views', eventData, this.get('node'));
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
    },
});
