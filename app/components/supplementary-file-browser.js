import Ember from 'ember';
import loadAll from 'ember-osf/utils/load-relationship';

export default Ember.Component.extend({
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
        this.get('node.files')
            .then(providers => {
                this.set('provider', providers.findBy('name', 'osfstorage'));
                return loadAll(this.get('provider'), 'files', this.get('files'), {'page[size]': 50});
            })
            .then(() => {
                let pf = this.get('files').findBy('id', this.get('preprint.primaryFile.id'));
                if (pf) {
                    this.get('files').removeObject(pf);
                    this.set('primaryFile', pf);
                }

                this.set('selectedFile', this.get('primaryFile'));
                this.set('files', [this.get('primaryFile')].concat(this.get('files')));
            });

    }.observes('preprint'),

    init() {
        this._super(...arguments);
        this.__files();

    },
    actions: {
        next() {
            if (this.get('endIndex') > this.get('files.length')) return;

            this.set('scrollAnim', 'toLeft');
            this.set('endIndex', this.get('endIndex') + 5);
            this.set('startIndex', this.get('startIndex') + 5);
        },
        prev() {
            if (this.get('startIndex') <= 0) return;

            this.set('scrollAnim', 'toRight');
            this.set('endIndex', this.get('endIndex') - 5);
            this.set('startIndex', this.get('startIndex') - 5);
        },
        changeFile(file) {
            this.set('selectedFile', file);

            if (this.attrs.chooseFile) {
                this.sendAction('chooseFile', file);
            }
        },
    },
});
