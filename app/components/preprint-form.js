import Ember from 'ember';

export default Ember.Component.extend({
    store: Ember.inject.service(),
    actions: {
        //TODO: Add error handling
        //TODO: Add changability of button text
        createPreprint(title, abstract, authors, tags, journal) {
            let buttonAction = this.get('buttonAction'),
                subject = this.$('select[name=subject]').val();
            //Create some form of preprint
            buttonAction(title, abstract, authors, subject, tags, journal);

        }
    }
});
