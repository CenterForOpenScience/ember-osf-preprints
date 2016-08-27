import Ember from 'ember';

export default Ember.Component.extend({

    numMaxChars: 300,
    showBody: false,
    footerIcon: Ember.computed('showBody', function() {
        return this.get('showBody') ? 'caret-up' : 'caret-down';
    }),
    result: null,

    shortDescription: Ember.computed('result', function() {
        let result = this.get('result');
        if (result.description && result.description.length > this.numMaxChars) {
            return result.description.substring(0, this.numMaxChars) + '...';
        }
        return result.description;
    }),

    osfID: function() {
        return this.get('result.osfProvider') ?
            /osf.io\/(\w+)\/$/.exec(this.get('result.lists.links.0.url'))[1]
            : false;
    }.property('result'),

    hyperlink: function() {
        return this.get('result.lists.links.0.url');
    }.property('result'),

    actions: {
        toggleShowBody() {
            this.set('showBody', !this.showBody);
        },
        select(item) {
            this.attrs.select(item);
        }
    }

});
