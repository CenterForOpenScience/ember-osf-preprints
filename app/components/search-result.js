import Ember from 'ember';

export default Ember.Component.extend({

    numMaxChars: 400,
    showBody: false,
    footerIcon: Ember.computed('showBody', function() {
        return this.get('showBody') ? 'caret-up' : 'caret-down';
    }),
    truncateDescription: true,
    result: null,

    displayDescription: Ember.computed('result', 'truncateDescription', function() {
        let result = this.get('result');
        if (result.description) {
            if (this.truncateDescription) {
                return result.description.substring(0, this.numMaxChars) + '...';
            }
            return result.description;
        }
        return '';
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
        toggleShowDescription() {
            this.set('truncateDescription', !this.truncateDescription);
        },
        toggleShowBody() {
            this.set('showBody', !this.showBody);
        },
        select(item) {
            this.attrs.select(item);
        }
    }

});
