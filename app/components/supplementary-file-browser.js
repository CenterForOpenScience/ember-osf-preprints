import Ember from 'ember';
import loadAll from 'ember-osf/utils/load-relationship';
import Analytics from '../mixins/analytics';

export default Ember.Component.extend(Analytics, {
    keen: Ember.inject.service(),
    elementId: 'preprint-file-view',
    endIndex: 6,
    startIndex: 0,

    scrollAnim: '',
    selectedFile: null,

    selectedFileChanged: Ember.observer('selectedFile', function() {
        const eventData = {
            node: {
                type: 'preprint',
                id: this.get('preprint.id')
            },
            file: {
                id: this.get('selectedFile.id')
            }
        };

        this.get('keen').sendEvent('file_views', eventData, true);
    }),

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
        this.get('preprint').get('files')
            .then(providers => {
                this.set('provider', providers.findBy('name', 'osfstorage'));
                return loadAll(this.get('provider'), 'files', this.get('files'), {'page[size]': 50});
            })
            .then(() => {
                const primaryFile = this.get('files')
                    .findBy('id', this.get('preprint.primaryFile.id'));

                if (primaryFile) {
                    this.get('files').removeObject(primaryFile);
                    this.set('primaryFile', primaryFile);
                }

                this.set('selectedFile', primaryFile);
                this.set('files', [primaryFile, ...this.get('files')]);
            });

    }.observes('preprint'),

    init() {
        this._super(...arguments);
        this.__files();

    },
    actions: {
        next() {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'file browser',
                    action: 'click',
                    label: 'next'
                });

            if (this.get('endIndex') > this.get('files.length')) return;

            this.set('scrollAnim', 'toLeft');
            this.set('endIndex', this.get('endIndex') + 5);
            this.set('startIndex', this.get('startIndex') + 5);
        },
        prev() {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'file browser',
                    action: 'click',
                    label: 'prev'
                });

            if (this.get('startIndex') <= 0) return;

            this.set('scrollAnim', 'toRight');
            this.set('endIndex', this.get('endIndex') - 5);
            this.set('startIndex', this.get('startIndex') - 5);
        },
        changeFile(file) {
            Ember.get(this, 'metrics')
                .trackEvent({
                    category: 'file browser',
                    action: 'select',
                    label: 'file'
                });

            this.set('selectedFile', file);

            if (this.attrs.chooseFile) {
                this.sendAction('chooseFile', file);
            }
        },
    },
});
