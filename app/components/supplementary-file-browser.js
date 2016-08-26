import Ember from 'ember';

export default Ember.Component.extend({
    elementId: 'preprint-file-view',
    startValue: 0,
    scrollAnim: '',
    numShowing: 6,
    selectedFile: null,
    // TODO Actually implement pagination
    showRightArrow: Ember.computed('numShowing', 'startValue', function() {
        return (this.get('startValue') + this.get('numShowing') < this.get('files').length);
    }),
    showLeftArrow: Ember.computed('numShowing', 'startValue', function() {
        return (this.get('startValue') !== 0);
    }),

    hasAdditionalFiles: function() {
        return this.get('files.length') > 1;
    }.property('files'),

    init() {
        this._super(...arguments);

        this.set('files', []);
        this.get('preprint').query('files', {'filter[name]': 'osfstorage'})
            .then(providers => {
                this.set('provider', providers.get('firstObject'));
                return this.get('provider').query('files', {'page[size]': 10})
            })
            .then(files => this.set('files', files))
            .then(() => {
                let pf = this.get('files').findBy('id', this.get('preprint.primaryFile.id'));
                if (pf) return this.set('selectedFile', pf);

                this.set('selectedFile', this.get('primaryFile'));
                this.set('files', [this.get('primaryFile')].concat(this.get('files')));
            });
    },
    actions: {
        moveLeft() {
            const start = this.get('startValue');
            const numShowing = this.get('numShowing');
            this.set('scrollAnim', 'toRight');
            if (start - numShowing >= 0) {
                this.set('startValue', start - numShowing);
            }
        },
        moveRight() {
            const start = this.get('startValue');
            const numShowing = this.get('numShowing');
            this.set('scrollAnim', 'toLeft');
            if (start + numShowing <= this.get('files').length) {
                this.set('startValue', start + numShowing);
            }
        },
        changeFile(file) {
            this.set('selectedFile', file);
        },
    },
});
