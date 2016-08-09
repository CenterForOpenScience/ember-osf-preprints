import Ember from 'ember';

export default Ember.Component.extend({

    numMaxChars: 400,
    showBody: false,
    footerIcon: Ember.computed('showBody', function() {
        return this.get('showBody') ? "caret-up" : "caret-down";
    }),
    truncateDescription: true,
    result: {
        description: ''
    },

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

    actions: {
        toggleShowDescription() {
            this.set('truncateDescription', !this.truncateDescription);
        },
        toggleShowBody() {
            this.set('showBody', !this.showBody);
        }
    }

});
