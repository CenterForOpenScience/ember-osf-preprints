import Ember from 'ember';

export default Ember.Component.extend({

    numMaxChars: 400,
    truncateDescription: true,
    displayDescription: Ember.computed('result', 'truncateDescription', function() {
        let result = this.get('result');
        if (result.description){
            if (this.truncateDescription) {
                return result.description.substring(0, this.numMaxChars) + "...";
            }
            return result.description;
        }
        return "";
    }),

    actions: {
        toggleShowDescription() {
            this.set('truncateDescription', !this.truncateDescription);
        }
    }

});
